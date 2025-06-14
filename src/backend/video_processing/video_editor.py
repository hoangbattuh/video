from moviepy.editor import VideoFileClip
import moviepy.config
import os
import subprocess
from src.renderer.gui.constants import NOTIFICATION_TITLE, SUCCESS_REMOVE_AUDIO_MESSAGE

moviepy.config.change_settings({"FFMPEG_BINARY": "ffmpeg"})

def remove_audio(input_path, output_dir, remove_type="all"):
    """
    Xóa âm thanh khỏi video sử dụng ffmpeg.

    Args:
        input_path (str): Đường dẫn đến file video đầu vào
        output_dir (str): Thư mục chứa file đầu ra
        remove_type (str): Loại xóa âm thanh:
            - "all": Xóa toàn bộ âm thanh
            - "copy": Tạo bản sao không âm thanh, giữ lại bản gốc
    """
    try:
        # Tạo tên file đầu ra
        filename = os.path.basename(input_path)
        name, ext = os.path.splitext(filename)
        if remove_type == "copy":
            output_filename = f"{name}_no_audio{ext}"
        else:
            output_filename = f"{name}_muted{ext}"
        
        output_path = os.path.join(output_dir, output_filename)

        # Chuẩn bị lệnh ffmpeg
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-c:v', 'copy',     # Giữ nguyên codec video
            '-an',              # Loại bỏ audio stream
            '-y',               # Ghi đè file nếu đã tồn tại
            output_path
        ]

        # Thực thi lệnh
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"FFmpeg error: {result.stderr}")

        return output_path

    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Lỗi khi xử lý video: {str(e)}")
    except Exception as e:
        raise RuntimeError(f"Lỗi không xác định: {str(e)}")