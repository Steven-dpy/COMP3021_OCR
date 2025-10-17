from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import os
import uuid
from django.conf import settings
from .services import RecognitionService

# Create upload directory
UPLOAD_DIR = os.path.join(settings.BASE_DIR, '..', 'share')
os.makedirs(UPLOAD_DIR, exist_ok=True)

@api_view(['POST'])
@permission_classes([AllowAny])
def upload_image(request):
    """
    Upload image and perform serial number recognition
    """


    if 'image' not in request.FILES:
        return Response({
            'success': False,
            'error': 'Image file not found'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Save uploaded image
        image_file = request.FILES['image']
        filename = f'{uuid.uuid4()}_{image_file.name}'

        # The file name may contains Chinese, it would be better to encode it.
        filename = filename.encode('utf-8').decode('utf-8')
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, 'wb+') as destination:
            for chunk in image_file.chunks():
                destination.write(chunk)
        
        print("Save uploaded image success.")

        # Call recognition service
        recognition_service = RecognitionService()
        print("RecognitionService init success.")
        result, success = recognition_service.process_image(file_path)

        # only keep the file name
        result['cropped_image'] = os.path.basename(result['cropped_image'])
        result['stretched_image'] = os.path.basename(result['stretched_image'])
        result['processed_image'] = os.path.basename(result['processed_image'])
        result['ocr_image'] = os.path.basename(result['ocr_image'])


        print("Process image result", result, success)

        if success:
            return Response({
                    'success': True,
                    'serial_number': result['serial_number'],
                    'confidence': result['confidence'],
                    'processing_time': result['processing_time'],
                    'origin_image': filename,
                    'cropped_image': result['cropped_image'],
                    'stretched_image': result['stretched_image'],
                    'processed_image': result['processed_image'],
                    'ocr_image': result['ocr_image'],
                })

        else:
            return Response({
                'success': False,
                'error': result['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        return Response({
            'success': False,
            'error': f'Error occurred while processing image: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
