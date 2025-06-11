"""
Module ghép video từ nhiều tệp thành một tệp duy nhất.
"""

import os
from moviepy.editor import VideoFileClip, concatenate_videoclips

def merge_videos(input_paths, output_path, stop_flag, update_progress, set_status, messagebox):
    """Ghép nhiều video thành một video duy nhất."""
    try:
        stop_flag.clear()
        clips = []
        total_duration = 0
        try:
            for path in input_paths:
                if stop_flag.is_set():
                    set_status("Tiến trình ghép đã bị dừng.")
                    messagebox.showinfo("Thông báo", "Tiến trình ghép đã bị dừng.")
                    update_progress(0)
                    return
                clip = VideoFileClip(path)
                clips.append(clip)
                total_duration += clip.duration
            final_clip = concatenate_videoclips(clips)
            final_clip.write_videofile(
                output_path,
                audio_codec="aac",
                preset="medium",
                threads=4,
                logger=None
            )
        finally:
            for clip in clips:
                clip.close()
        if not stop_flag.is_set():
            set_status("✅ Ghép video thành công.")
            messagebox.showinfo("Hoàn tất", "Đã ghép các video thành công.")
        update_progress(0)
    except Exception as e:
        set_status(f"❌ Lỗi khi ghép video: {e}")
        messagebox.showerror("Lỗi", str(e))
        if os.path.exists(output_path):
            os.remove(output_path)