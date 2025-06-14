from moviepy.editor import VideoFileClip, concatenate_videoclips
import os
import moviepy.config
from moviepy.editor import VideoFileClip, concatenate_videoclips
moviepy.config.change_settings({"FFMPEG_BINARY": "ffmpeg"})

def merge_videos(video_paths, output_path, stop_flag, update_progress, set_status, messagebox):
    try:
        clips = []
        total_clips = len(video_paths)
        for i, path in enumerate(video_paths):
            if stop_flag.is_set():
                set_status("Tiến trình ghép đã bị dừng.")
                messagebox.showinfo("Thông báo", "Tiến trình ghép đã bị dừng.")
                return
            update_progress(int((i / total_clips) * 50), f"Đang tải video {i+1}/{total_clips}")
            clips.append(VideoFileClip(path))

        update_progress(50, "Đang ghép các video...")
        final_clip = concatenate_videoclips(clips)
        
        update_progress(75, "Đang ghi file video...")
        final_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")
        
        update_progress(100, "Ghép video hoàn tất!")
        set_status("Ghép video hoàn tất!")
        messagebox.showinfo("Hoàn tất", "Ghép video hoàn tất!")

    except Exception as e:
        set_status(f"Lỗi khi ghép video: {e}")
        messagebox.showerror("Lỗi", f"Đã xảy ra lỗi khi ghép video: {e}")
    finally:
        for clip in clips:
            if clip.is_playing:
                clip.close()
        if 'final_clip' in locals() and final_clip.is_playing:
            final_clip.close()