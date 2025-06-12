from moviepy.editor import VideoFileClip
import os
import math
import subprocess
from gui.constants import (
    PROCESS_STOPPED_MESSAGE,
    NOTIFICATION_TITLE,
    COMPLETED_TITLE,
    ERROR_WRITE_FILE_TITLE
)

def get_video_duration(input_path):
    """Lấy thời lượng video sử dụng ffprobe"""
    cmd = [
        'ffprobe', 
        '-v', 'error', 
        '-show_entries', 'format=duration', 
        '-of', 'default=noprint_wrappers=1:nokey=1', 
        input_path
    ]
    try:
        output = subprocess.check_output(cmd).decode().strip()
        return float(output)
    except subprocess.CalledProcessError as e:
        raise Exception(f"Không thể đọc thời lượng video: {str(e)}")

def cut_video_ffmpeg(input_path, output_path, start_time, duration):
    """Cắt video sử dụng ffmpeg"""
    cmd = [
        'ffmpeg',
        '-i', input_path,
        '-ss', str(start_time),
        '-t', str(duration),
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-y',  # Ghi đè file nếu đã tồn tại
        output_path
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError as e:
        raise Exception(f"Lỗi khi cắt video: {e.stderr.decode()}")

def cut_by_segments(input_path, output_dir, num_segments, stop_flag, update_progress_safe, set_status_safe, messagebox):
    try:
        duration = get_video_duration(input_path)

        if duration < num_segments:
            messagebox.showwarning(NOTIFICATION_TITLE, "Video quá ngắn để cắt thành số lượng đoạn yêu cầu.")
            set_status_safe("Hoàn tác.")
            return

        segment_duration = duration / num_segments
        
        for i in range(num_segments):
            if stop_flag.is_set():
                set_status_safe(PROCESS_STOPPED_MESSAGE)
                messagebox.showinfo(NOTIFICATION_TITLE, PROCESS_STOPPED_MESSAGE)
                break

            start_time = i * segment_duration
            current_duration = segment_duration
            output_filename = os.path.join(output_dir, f"segment_{i+1}.mp4")
            
            try:
                cut_video_ffmpeg(input_path, output_filename, start_time, current_duration)
                update_progress_safe(int((i + 1) / num_segments * 100))
            except Exception as e:
                messagebox.showerror(ERROR_WRITE_FILE_TITLE, f"Không thể ghi tệp {output_filename}: {e}")
                set_status_safe("Lỗi trong quá trình ghi tệp.")
                return

        set_status_safe(COMPLETED_TITLE)
        messagebox.showinfo(COMPLETED_TITLE, "Cắt video theo số lượng đoạn hoàn tất!")

    except Exception as e:
        messagebox.showerror(NOTIFICATION_TITLE, f"Đã xảy ra lỗi: {e}")
        set_status_safe("Lỗi trong quá trình cắt video.")

def cut_by_duration(input_path, output_dir, segment_duration, stop_flag, update_progress_safe, set_status_safe, messagebox):
    try:
        duration = get_video_duration(input_path)

        if segment_duration > duration:
            messagebox.showwarning(NOTIFICATION_TITLE, "Thời lượng đoạn yêu cầu lớn hơn thời lượng video gốc.")
            set_status_safe("Hoàn tác.")
            return

        num_segments = math.ceil(duration / segment_duration)
        
        for i in range(num_segments):
            if stop_flag.is_set():
                set_status_safe(PROCESS_STOPPED_MESSAGE)
                messagebox.showinfo(NOTIFICATION_TITLE, PROCESS_STOPPED_MESSAGE)
                break

            start_time = i * segment_duration
            current_duration = min(segment_duration, duration - start_time)
            output_filename = os.path.join(output_dir, f"segment_{i+1}.mp4")

            try:
                cut_video_ffmpeg(input_path, output_filename, start_time, current_duration)
                update_progress_safe(int((i + 1) / num_segments * 100))
            except Exception as e:
                messagebox.showerror(ERROR_WRITE_FILE_TITLE, f"Không thể ghi tệp {output_filename}: {e}")
                set_status_safe("Lỗi trong quá trình ghi tệp.")
                return

        set_status_safe(COMPLETED_TITLE)
        messagebox.showinfo(COMPLETED_TITLE, "Cắt video theo thời lượng hoàn tất!")

    except Exception as e:
        messagebox.showerror(NOTIFICATION_TITLE, f"Đã xảy ra lỗi: {e}")
        set_status_safe("Lỗi trong quá trình cắt video.")

def cut_selected_segment(input_path, output_dir, start_time, end_time, stop_flag, update_progress_safe, set_status_safe, messagebox):
    try:
        duration = get_video_duration(input_path)

        if not isinstance(start_time, (int, float)) or not isinstance(end_time, (int, float)):
            messagebox.showerror(NOTIFICATION_TITLE, "Thời gian bắt đầu và kết thúc phải là số.")
            set_status_safe("Hoàn tác.")
            return

        if start_time < 0 or end_time < 0:
            messagebox.showerror(NOTIFICATION_TITLE, "Thời gian không được là số âm.")
            set_status_safe("Hoàn tác.")
            return

        if start_time >= end_time:
            messagebox.showerror(NOTIFICATION_TITLE, "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.")
            set_status_safe("Hoàn tác.")
            return

        if end_time > duration:
            messagebox.showwarning(NOTIFICATION_TITLE, f"Thời gian kết thúc ({end_time:.2f}s) vượt quá thời lượng video ({duration:.2f}s). Sẽ cắt đến hết video.")
            end_time = duration

        if stop_flag.is_set():
            set_status_safe(PROCESS_STOPPED_MESSAGE)
            messagebox.showinfo(NOTIFICATION_TITLE, PROCESS_STOPPED_MESSAGE)
            return

        output_filename = os.path.join(output_dir, f"cut_segment_{start_time:.0f}-{end_time:.0f}.mp4")
        segment_duration = end_time - start_time

        try:
            cut_video_ffmpeg(input_path, output_filename, start_time, segment_duration)
            update_progress_safe(100)
            set_status_safe(COMPLETED_TITLE)
            messagebox.showinfo(COMPLETED_TITLE, "Cắt đoạn đã chọn hoàn tất!")
        except Exception as e:
            messagebox.showerror(ERROR_WRITE_FILE_TITLE, f"Không thể ghi tệp {output_filename}: {e}")
            set_status_safe("Lỗi trong quá trình ghi tệp.")

    except Exception as e:
        messagebox.showerror(NOTIFICATION_TITLE, f"Đã xảy ra lỗi: {e}")
        set_status_safe("Lỗi trong quá trình cắt video.")