from moviepy.editor import VideoFileClip, concatenate_videoclips
import os
import moviepy.config
from moviepy.editor import VideoFileClip, concatenate_videoclips
from src.renderer.gui.constants import PROCESS_STOPPED_MESSAGE, NOTIFICATION_TITLE, COMPLETED_TITLE
moviepy.config.change_settings({"FFMPEG_BINARY": "ffmpeg"})

def merge_videos(video_paths, output_path, stop_flag, update_progress, set_status, messagebox):
    try:
        clips = []
        total_clips = len(video_paths)
        for i, path in enumerate(video_paths):
            if stop_flag.is_set():
                set_status(PROCESS_STOPPED_MESSAGE)
                messagebox.showinfo(NOTIFICATION_TITLE, PROCESS_STOPPED_MESSAGE)
                return
            update_progress(int((i / total_clips) * 50), f"Đang tải video {i+1}/{total_clips}")
            clips.append(VideoFileClip(path))

        update_progress(50, "Đang ghép các video...")
        final_clip = concatenate_videoclips(clips)
        
        update_progress(75, "Đang ghi file video...")
        final_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")
        
        update_progress(100, "Ghép video hoàn tất!")
        set_status(COMPLETED_TITLE)
        messagebox.showinfo(COMPLETED_TITLE, "Ghép video hoàn tất!")

    except Exception as e:
        set_status(f"Lỗi khi ghép video: {e}")
        messagebox.showerror("Lỗi", f"Đã xảy ra lỗi khi ghép video: {e}")
    finally:
        for clip in clips:
            if clip.is_playing:
                clip.close()
        if 'final_clip' in locals() and final_clip.is_playing:
            final_clip.close()