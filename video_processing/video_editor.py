from moviepy.editor import VideoFileClip
import moviepy.config
moviepy.config.change_settings({"FFMPEG_BINARY": "ffmpeg"})

def remove_audio(input_path, output_path, remove_type="all"):
    """
    Xóa âm thanh khỏi video hoặc tạo bản sao video không có âm thanh.

    Args:
        input_path (str): Đường dẫn đến file video đầu vào.
        output_path (str): Đường dẫn đến file video đầu ra.
        remove_type (str): Loại bỏ âm thanh. Có thể là "all" (xóa toàn bộ âm thanh)
                           hoặc "copy" (tạo bản sao không âm thanh, giữ lại bản gốc).
    """
    try:
        clip = VideoFileClip(input_path)
        if remove_type == "all":
            clip_no_audio = clip.without_audio()
            clip_no_audio.write_videofile(output_path, codec="libx264")
        elif remove_type == "copy":
            # Tạo bản sao không âm thanh, giữ lại bản gốc
            clip_no_audio = clip.without_audio()
            clip_no_audio.write_videofile(output_path, codec="libx264")
        clip.close()
        return True
    except Exception as e:
        print(f"Lỗi khi xóa âm thanh: {e}")
        return False