from moviepy.editor import VideoFileClip, concatenate_videoclips
import os
import moviepy.config
moviepy.config.change_settings({"FFMPEG_BINARY": "ffmpeg"})

def merge_videos(video_paths, output_path, stop_flag, update_progress, set_status, messagebox):
    try:
        clips = []
        for path in video_paths:
            if stop_flag.is_set():
                set_status("Tiến trình ghép đã bị dừng.")
                messagebox.showinfo("Thông báo", "Tiến trình ghép đã bị dừng.")
                return
            clips.append(VideoFileClip(path))

        final_clip = concatenate_videoclips(clips)
        final_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")
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