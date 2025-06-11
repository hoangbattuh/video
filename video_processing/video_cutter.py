"""
Module xử lý cắt video với các chế độ: theo số đoạn, theo thời lượng, hoặc đoạn chọn thủ công.
"""

import os
from moviepy.editor import VideoFileClip
import threading

def _show_error(messagebox, title, msg):
    if messagebox:
        try:
            messagebox.showerror(title, msg)
        except Exception:
            print(f"{title}: {msg}")
    else:
        print(f"{title}: {msg}")

def _show_info(messagebox, title, msg):
    if messagebox:
        try:
            messagebox.showinfo(title, msg)
        except Exception:
            print(f"{title}: {msg}")
    else:
        print(f"{title}: {msg}")

def cut_by_segments(input_path, output_dir, num_segments, stop_flag, update_progress, set_status, messagebox=None):
    """Cắt video thành nhiều đoạn bằng nhau theo số lượng đoạn."""
    try:
        stop_flag.clear()
        with VideoFileClip(input_path) as clip:
            duration = clip.duration
            segment_length = duration / num_segments
            for i in range(num_segments):
                if stop_flag.is_set():
                    set_status("Tiến trình cắt đã bị dừng.")
                    _show_info(messagebox, "Thông báo", "Tiến trình cắt đã bị dừng.")
                    update_progress(0)
                    break
                start = i * segment_length
                end = min((i + 1) * segment_length, duration)
                update_progress(start)
                output_path = os.path.join(output_dir, f"segment_{i+1}.mp4")
                try:
                    clip.subclip(start, end).write_videofile(
                        output_path,
                        audio_codec="aac",
                        preset="medium",
                        threads=4,
                        logger=None
                    )
                except Exception as write_error:
                    set_status(f"❌ Lỗi khi ghi tệp {output_path}: {write_error}")
                    _show_error(messagebox, "Lỗi ghi tệp", str(write_error))
                    if os.path.exists(output_path):
                        os.remove(output_path)
                    raise write_error
        if not stop_flag.is_set():
            set_status("✅ Cắt video theo số lượng thành công.")
            _show_info(messagebox, "Hoàn tất", "Đã cắt video thành nhiều đoạn.")
            # Xóa các tệp tạm thời do moviepy tạo ra
            for file in os.listdir(os.path.dirname(input_path)):
                if "TEMP_MPY_wvf_snd" in file:
                    os.remove(os.path.join(os.path.dirname(input_path), file))
        update_progress(0)
    except Exception as e:
        set_status(f"❌ Lỗi khi cắt theo số lượng: {e}")
        _show_error(messagebox, "Lỗi", str(e))

def cut_by_duration(input_path, output_dir, segment_duration, stop_flag, update_progress, set_status, messagebox=None):
    """Cắt video thành nhiều đoạn theo thời lượng mỗi đoạn."""
    try:
        stop_flag.clear()
        with VideoFileClip(input_path) as clip:
            duration = clip.duration
            num_segments = int(duration // segment_duration) + (1 if duration % segment_duration > 0 else 0)
            for i in range(num_segments):
                if stop_flag.is_set():
                    set_status("Tiến trình cắt đã bị dừng.")
                    _show_info(messagebox, "Thông báo", "Tiến trình cắt đã bị dừng.")
                    update_progress(0)
                    break
                start = i * segment_duration
                end = min((i + 1) * segment_duration, duration)
                update_progress(start)
                output_path = os.path.join(output_dir, f"duration_segment_{i+1}.mp4")
                try:
                    clip.subclip(start, end).write_videofile(
                        output_path,
                        audio_codec="aac",
                        preset="medium",
                        threads=4,
                        logger=None
                    )
                except Exception as write_error:
                    set_status(f"❌ Lỗi khi ghi tệp {output_path}: {write_error}")
                    _show_error(messagebox, "Lỗi ghi tệp", str(write_error))
                    if os.path.exists(output_path):
                        os.remove(output_path)
                    raise write_error
        if not stop_flag.is_set():
            set_status("✅ Cắt video theo thời lượng thành công.")
            _show_info(messagebox, "Hoàn tất", "Đã cắt video theo thời lượng.")
            for file in os.listdir(os.path.dirname(input_path)):
                if "TEMP_MPY_wvf_snd" in file:
                    os.remove(os.path.join(os.path.dirname(input_path), file))
        update_progress(0)
    except Exception as e:
        set_status(f"❌ Lỗi khi cắt theo thời lượng: {e}")
        _show_error(messagebox, "Lỗi", str(e))

def cut_selected_segment(input_path, output_dir, start_time, end_time, stop_flag, update_progress, set_status, messagebox=None):
    """Cắt đoạn video được chọn thủ công."""
    try:
        stop_flag.clear()
        output_path = os.path.join(output_dir, "selected_segment.mp4")
        with VideoFileClip(input_path) as clip:
            update_progress(0)
            if not stop_flag.is_set():
                try:
                    clip.subclip(start_time, end_time).write_videofile(
                        output_path,
                        audio_codec="aac",
                        preset="medium",
                        threads=4,
                        logger=None
                    )
                except Exception as write_error:
                    set_status(f"❌ Lỗi khi ghi tệp {output_path}: {write_error}")
                    _show_error(messagebox, "Lỗi ghi tệp", str(write_error))
                    if os.path.exists(output_path):
                        os.remove(output_path)
                    raise write_error
                set_status("✅ Cắt đoạn đã chọn thành công.")
                _show_info(messagebox, "Hoàn tất", "Đã cắt đoạn đã chọn.")
                for file in os.listdir(os.path.dirname(input_path)):
                    if "TEMP_MPY_wvf_snd" in file:
                        os.remove(os.path.join(os.path.dirname(input_path), file))
            else:
                set_status("Tiến trình cắt đã bị dừng.")
                _show_info(messagebox, "Thông báo", "Tiến trình cắt đã bị dừng.")
        update_progress(0)
    except Exception as e:
        set_status(f"❌ Lỗi khi cắt đoạn chọn: {e}")
        _show_error(messagebox, "Lỗi", str(e))