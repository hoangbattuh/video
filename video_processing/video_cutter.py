from moviepy.editor import VideoFileClip, concatenate_videoclips
import os
import math
import moviepy.config
from moviepy.editor import VideoFileClip
moviepy.config.change_settings({"FFMPEG_BINARY": "ffmpeg"})
from gui.constants import (
    PROCESS_STOPPED_MESSAGE,
    NOTIFICATION_TITLE,
    COMPLETED_TITLE,
    ERROR_WRITE_FILE_TITLE
)

def cut_by_segments(input_path, output_dir, num_segments, stop_flag, update_progress_safe, set_status_safe, messagebox):
    try:
        import sys
        import moviepy.config
        moviepy.config.change_settings({"FFMPEG_BINARY": "ffmpeg"})
        clip = VideoFileClip(input_path)
        duration = clip.duration

        if duration < num_segments:
            messagebox.showwarning(NOTIFICATION_TITLE, "Video quá ngắn để cắt thành số lượng đoạn yêu cầu.")
            set_status_safe("Hoàn tác.")
            clip.close()
            return

        segment_duration = duration / num_segments
        clips = []
        for i in range(num_segments):
            if stop_flag.is_set():
                set_status_safe(PROCESS_STOPPED_MESSAGE)
                messagebox.showinfo(NOTIFICATION_TITLE, PROCESS_STOPPED_MESSAGE)
                break

            start_time = i * segment_duration
            end_time = (i + 1) * segment_duration
            output_filename = os.path.join(output_dir, f"segment_{i+1}.mp4")
            try:
                segment = clip.subclip(start_time, end_time)
                # Fix: set logger=None to avoid NoneType 'stdout' error
                segment.write_videofile(output_filename, codec="libx264", audio_codec="aac", logger=None)
                segment.close()
                update_progress_safe(int((i + 1) / num_segments * 100))
            except Exception as e:
                messagebox.showerror(ERROR_WRITE_FILE_TITLE, f"Không thể ghi tệp {output_filename}: {e}")
                set_status_safe("Lỗi trong quá trình ghi tệp.")
                break
        else:
            set_status_safe(COMPLETED_TITLE)
            messagebox.showinfo(COMPLETED_TITLE, "Cắt video theo số lượng đoạn hoàn tất!")

    except Exception as e:
        messagebox.showerror(NOTIFICATION_TITLE, f"Đã xảy ra lỗi: {e}")
        set_status_safe("Lỗi trong quá trình cắt video.")
    finally:
        if 'clip' in locals():
            clip.close()

def cut_by_duration(input_path, output_dir, segment_duration, stop_flag, update_progress_safe, set_status_safe, messagebox):
    try:
        clip = VideoFileClip(input_path)
        duration = clip.duration

        if segment_duration > duration:
            messagebox.showwarning(NOTIFICATION_TITLE, "Thời lượng đoạn yêu cầu lớn hơn thời lượng video gốc.")
            set_status_safe("Hoàn tác.")
            clip.close()
            return

        num_segments = math.ceil(duration / segment_duration)
        for i in range(num_segments):
            if stop_flag.is_set():
                set_status_safe(PROCESS_STOPPED_MESSAGE)
                messagebox.showinfo(NOTIFICATION_TITLE, PROCESS_STOPPED_MESSAGE)
                break

            start_time = i * segment_duration
            end_time = min((i + 1) * segment_duration, duration)
            output_filename = os.path.join(output_dir, f"segment_{i+1}.mp4")

            try:
                segment = clip.subclip(start_time, end_time)
                # Fix: set logger=None to avoid NoneType 'stdout' error
                segment.write_videofile(output_filename, codec="libx264", audio_codec="aac", logger=None)
                segment.close()
                update_progress_safe(int((i + 1) / num_segments * 100))
            except Exception as e:
                messagebox.showerror(ERROR_WRITE_FILE_TITLE, f"Không thể ghi tệp {output_filename}: {e}")
                set_status_safe("Lỗi trong quá trình ghi tệp.")
                break
        else:
            set_status_safe(COMPLETED_TITLE)
            messagebox.showinfo(COMPLETED_TITLE, "Cắt video theo thời lượng hoàn tất!")

    except Exception as e:
        messagebox.showerror(NOTIFICATION_TITLE, f"Đã xảy ra lỗi: {e}")
        set_status_safe("Lỗi trong quá trình cắt video.")
    finally:
        if 'clip' in locals():
            clip.close()

def cut_selected_segment(input_path, output_dir, start_time, end_time, stop_flag, update_progress_safe, set_status_safe, messagebox):
    try:
        clip = VideoFileClip(input_path)
        duration = clip.duration

        if not isinstance(start_time, (int, float)) or not isinstance(end_time, (int, float)):
            messagebox.showerror(NOTIFICATION_TITLE, "Thời gian bắt đầu và kết thúc phải là số.")
            set_status_safe("Hoàn tác.")
            clip.close()
            return

        if start_time < 0 or end_time < 0:
            messagebox.showerror(NOTIFICATION_TITLE, "Thời gian không được là số âm.")
            set_status_safe("Hoàn tác.")
            clip.close()
            return

        if start_time >= end_time:
            messagebox.showerror(NOTIFICATION_TITLE, "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.")
            set_status_safe("Hoàn tác.")
            clip.close()
            return

        if end_time > duration:
            messagebox.showwarning(NOTIFICATION_TITLE, f"Thời gian kết thúc ({end_time:.2f}s) vượt quá thời lượng video ({duration:.2f}s). Sẽ cắt đến hết video.")
            end_time = duration

        if stop_flag.is_set():
            set_status_safe(PROCESS_STOPPED_MESSAGE)
            messagebox.showinfo(NOTIFICATION_TITLE, PROCESS_STOPPED_MESSAGE)
            clip.close()
            return

        output_filename = os.path.join(output_dir, f"cut_segment_{start_time:.0f}-{end_time:.0f}.mp4")

        try:
            segment = clip.subclip(start_time, end_time)
            # Fix: set logger=None to avoid NoneType 'stdout' error
            segment.write_videofile(output_filename, codec="libx264", audio_codec="aac", logger=None)
            segment.close()
            update_progress_safe(100) # Cập nhật hoàn tất 100%
            set_status_safe(COMPLETED_TITLE)
            messagebox.showinfo(COMPLETED_TITLE, "Cắt đoạn đã chọn hoàn tất!")
        except Exception as e:
            messagebox.showerror(ERROR_WRITE_FILE_TITLE, f"Không thể ghi tệp {output_filename}: {e}")
            set_status_safe("Lỗi trong quá trình ghi tệp.")

    except Exception as e:
        messagebox.showerror(NOTIFICATION_TITLE, f"Đã xảy ra lỗi: {e}")
        set_status_safe("Lỗi trong quá trình cắt video.")
    finally:
        if 'clip' in locals():
            clip.close()