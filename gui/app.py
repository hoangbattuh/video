import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import threading
import os
from gui.constants import NOTIFICATION_TITLE, SELECT_OUTPUT_DIR_BUTTON_TEXT, OUTPUT_DIR_NOT_SELECTED_LABEL, DEFAULT_VIDEO_SELECTION_LABEL, ERROR_WRITE_FILE_TITLE, SUCCESS_REMOVE_AUDIO_TITLE, SUCCESS_REMOVE_AUDIO_MESSAGE, ERROR_REMOVE_AUDIO_TITLE, ERROR_REMOVE_AUDIO_MESSAGE
from video_processing.video_cutter import VideoCutter
from video_processing.video_merger import VideoMerger
from video_processing.video_editor import remove_audio

class VideoEditorPro(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Video Editor Pro")
        self.geometry("800x600")

        # Cấu hình style cho ứng dụng
        self.style = ttk.Style(self)
        self.style.theme_use('clam') # Sử dụng theme 'clam' làm nền


        # Màu nền sáng nhẹ
        self.style.configure('.', background='#F0F0F0') # Xám nhạt
        self.style.configure('TFrame', background='#F0F0F0')
        self.style.configure('TLabel', background='#F0F0F0', font=(FONT_FAMILY, 10))
        self.style.configure('TButton', font=(FONT_FAMILY, 10))
        self.style.configure('TEntry', font=(FONT_FAMILY, 10))
        self.style.configure('TCheckbutton', background='#F0F0F0', font=(FONT_FAMILY, 10))
        self.style.configure('TRadiobutton', background='#F0F0F0', font=(FONT_FAMILY, 10))
        self.style.configure('TNotebook', background='#F0F0F0')
        self.style.configure('TNotebook.Tab', background='#E0E0E0', font=(FONT_FAMILY, 10))
        self.style.map('TNotebook.Tab', background=[('selected', '#FFFFFF')])

        self.selected_video_path = None
        self.output_directory = None
        self.merge_output_directory = None
        self.audio_output_directory = None

        # Thanh menu trên cùng
        menubar = tk.Menu(self)
        self.config(menu=menubar)

        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Tệp", menu=file_menu)
        file_menu.add_command(label="Thoát", command=self.quit)

        edit_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Chỉnh sửa", menu=edit_menu)

        help_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Trợ giúp", menu=help_menu)

        # Tab chức năng chính
        self.notebook = ttk.Notebook(self)
        self.notebook.pack(expand=True, fill="both", padx=10, pady=10)

            # Tab Cắt Video
        self.trim_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.trim_tab, text="Cắt Video")

        # Khu vực tải & xem trước video
        load_preview_frame = ttk.LabelFrame(self.trim_tab, text="Tải & Xem trước Video")
        load_preview_frame.pack(padx=10, pady=10, fill="x")

        select_video_frame = ttk.Frame(load_preview_frame)
        select_video_frame.pack(fill="x", padx=5, pady=5)

        ttk.Button(select_video_frame, text="📂 Chọn Video", command=self.select_video).pack(side="left")
        self.selected_video_label = ttk.Label(select_video_frame, text=DEFAULT_VIDEO_SELECTION_LABEL)
        self.selected_video_label.pack(side="left", padx=5)

        # Thanh hiển thị thời lượng
        time_display_frame = ttk.Frame(load_preview_frame)
        time_display_frame.pack(fill="x", padx=5, pady=5)
        self.start_time_label = ttk.Label(time_display_frame, text=START_TIME_LABEL)
        self.start_time_label.pack(side="left")
        self.end_time_label = ttk.Label(time_display_frame, text="Kết thúc: 00:00:00")
        self.end_time_label.pack(side="right")

        # Chế độ cắt
        cut_mode_frame = ttk.LabelFrame(self.trim_tab, text="Chế độ Cắt")
        cut_mode_frame.pack(padx=10, pady=10, fill="x")

        # Sử dụng grid để bố trí các tùy chọn cắt
        cut_mode_grid = ttk.Frame(cut_mode_frame)
        cut_mode_grid.pack(fill="x", padx=5, pady=5)

        # Cắt theo số đoạn
        ttk.Label(cut_mode_grid, text="Số lượng đoạn:").grid(row=0, column=0, sticky="w", padx=5, pady=5)
        self.num_segments_entry = ttk.Entry(cut_mode_grid, width=10)
        self.num_segments_entry.grid(row=0, column=1, sticky="w", padx=5, pady=5)
        ttk.Button(cut_mode_grid, text="Cắt theo số lượng", command=self.cut_by_segments).grid(row=0, column=2, sticky="w", padx=5, pady=5)

        # Cắt theo thời lượng
        ttk.Label(cut_mode_grid, text="Thời lượng mỗi đoạn (giây):").grid(row=1, column=0, sticky="w", padx=5, pady=5)
        self.segment_duration_entry = ttk.Entry(cut_mode_grid, width=10)
        self.segment_duration_entry.grid(row=1, column=1, sticky="w", padx=5, pady=5)
        ttk.Button(cut_mode_grid, text="Cắt theo thời lượng", command=self.cut_by_duration).grid(row=1, column=2, sticky="w", padx=5, pady=5)

        # Cắt thủ công
        ttk.Label(cut_mode_grid, text="Bắt đầu (giây):").grid(row=2, column=0, sticky="w", padx=5, pady=5)
        self.start_time_entry = ttk.Entry(cut_mode_grid, width=10)
        self.start_time_entry.grid(row=2, column=1, sticky="w", padx=5, pady=5)

        ttk.Label(cut_mode_grid, text="Kết thúc (giây):").grid(row=3, column=0, sticky="w", padx=5, pady=5)
        self.end_time_entry = ttk.Entry(cut_mode_grid, width=10)
        self.end_time_entry.grid(row=3, column=1, sticky="w", padx=5, pady=5)

        ttk.Button(cut_mode_grid, text="✂ Cắt đoạn đã chọn", command=self.cut_selected_segment).grid(row=2, column=2, sticky="w", padx=5, pady=5, rowspan=2)

        # Khu vực lưu trữ & xuất video
        output_frame = ttk.LabelFrame(self.trim_tab, text="Lưu trữ & Xuất Video")
        output_frame.pack(padx=10, pady=10, fill="x")

        output_dir_frame = ttk.Frame(output_frame)
        output_dir_frame.pack(fill="x", padx=5, pady=5)
        ttk.Button(output_dir_frame, text=SELECT_OUTPUT_DIR_BUTTON_TEXT, command=self.select_output_directory).pack(side="left")
        self.output_dir_label = ttk.Label(output_dir_frame, text=OUTPUT_DIR_NOT_SELECTED_LABEL)
        self.output_dir_label.pack(side="left", padx=5)

        progress_stop_frame = ttk.Frame(output_frame) # Frame mới cho progress bar và stop button
        progress_stop_frame.pack(fill="x", padx=5, pady=5)

        self.progress_bar = ttk.Progressbar(progress_stop_frame, orient="horizontal", length=300, mode="determinate")
        self.progress_bar.pack(side="left", fill="x", expand=True, padx=(0, 5))
        ttk.Button(progress_stop_frame, text="⏹ Dừng Cắt", command=self.stop_processing).pack(side="left")

        self.stop_flag = threading.Event()

        # Tab Ghép Video
        self.merge_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.merge_tab, text="Ghép Video")
        # Khu vực thêm video
        add_video_frame = ttk.LabelFrame(self.merge_tab, text="Thêm Video để Ghép")
        add_video_frame.pack(padx=10, pady=10, fill="x")

        select_merge_video_frame = ttk.Frame(add_video_frame)
        select_merge_video_frame.pack(fill="x", padx=5, pady=5)

        ttk.Button(select_merge_video_frame, text="➕ Thêm Video", command=self.add_video_to_merge_list).pack(side="left")
        self.merge_video_listbox = tk.Listbox(add_video_frame, height=5)
        self.merge_video_listbox.pack(fill="both", expand=True, padx=5, pady=5)

        merge_actions_frame = ttk.Frame(add_video_frame)
        merge_actions_frame.pack(fill="x", padx=5, pady=5)
        ttk.Button(merge_actions_frame, text="⬆ Di chuyển lên", command=self.move_merge_video_up).pack(side="left")
        ttk.Button(merge_actions_frame, text="⬇ Di chuyển xuống", command=self.move_merge_video_down).pack(side="left", padx=5)
        ttk.Button(merge_actions_frame, text="❌ Xóa", command=self.remove_selected_merge_video).pack(side="left", padx=5)

        # Khu vực tùy chọn ghép
        merge_options_frame = ttk.LabelFrame(self.merge_tab, text="Tùy chọn Ghép")
        merge_options_frame.pack(padx=10, pady=10, fill="x")

        ttk.Checkbutton(merge_options_frame, text="Giữ nguyên chất lượng gốc").pack(anchor="w", padx=5, pady=2)
        ttk.Checkbutton(merge_options_frame, text="Đồng bộ hóa âm thanh").pack(anchor="w", padx=5, pady=2)

        # Khu vực lưu trữ & xuất video ghép
        merge_output_frame = ttk.LabelFrame(self.merge_tab, text="Lưu trữ & Xuất Video Ghép")
        merge_output_frame.pack(padx=10, pady=10, fill="x")

        merge_output_dir_frame = ttk.Frame(merge_output_frame)
        merge_output_dir_frame.pack(fill="x", padx=5, pady=5)
        ttk.Button(merge_output_dir_frame, text=SELECT_OUTPUT_DIR_BUTTON_TEXT, command=self.select_merge_output_directory).pack(side="left")
        self.merge_output_dir_label = ttk.Label(merge_output_dir_frame, text=OUTPUT_DIR_NOT_SELECTED_LABEL)
        self.merge_output_dir_label.pack(side="left", padx=5)

        ttk.Button(merge_output_frame, text="🚀 Bắt đầu Ghép", command=self.start_merge_videos).pack(pady=5)

        # Tab Xóa Âm thanh
        self.audio_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.audio_tab, text="Xóa Âm thanh")
        # Khu vực tải & xem trước video
        audio_load_preview_frame = ttk.LabelFrame(self.audio_tab, text="Tải & Xem trước Video (Xóa Âm thanh)")
        audio_load_preview_frame.pack(padx=10, pady=10, fill="x")

        audio_select_video_frame = ttk.Frame(audio_load_preview_frame)
        audio_select_video_frame.pack(fill="x", padx=5, pady=5)

        ttk.Button(audio_select_video_frame, text="📂 Chọn Video", command=self.select_audio_video).pack(side="left")
        self.audio_selected_video_label = ttk.Label(audio_select_video_frame, text=DEFAULT_VIDEO_SELECTION_LABEL)
        self.audio_selected_video_label.pack(side="left", padx=5)
        # Tùy chọn xóa âm thanh
        audio_remove_options_frame = ttk.LabelFrame(self.audio_tab, text="Tùy chọn Xóa Âm thanh")
        audio_remove_options_frame.pack(padx=10, pady=10, fill="x")

        ttk.Radiobutton(audio_remove_options_frame, text="Xóa toàn bộ âm thanh", value="all").pack(anchor="w", padx=5, pady=2)
        ttk.Radiobutton(audio_remove_options_frame, text="Giữ lại âm thanh gốc (tạo bản sao không âm thanh)", value="copy").pack(anchor="w", padx=5, pady=2)

        # Khu vực lưu trữ & xuất video
        audio_output_frame = ttk.LabelFrame(self.audio_tab, text="Lưu trữ & Xuất Video (Xóa Âm thanh)")
        audio_output_frame.pack(padx=10, pady=10, fill="x")

        audio_output_dir_frame = ttk.Frame(audio_output_frame)
        audio_output_dir_frame.pack(fill="x", padx=5, pady=5)
        ttk.Button(audio_output_dir_frame, text=SELECT_OUTPUT_DIR_BUTTON_TEXT, command=self.select_audio_output_directory).pack(side="left")
        self.audio_output_dir_label = ttk.Label(audio_output_dir_frame, text=OUTPUT_DIR_NOT_SELECTED_LABEL)
        self.audio_output_dir_label.pack(side="left", padx=5)

        ttk.Button(audio_output_frame, text="🚀 Bắt đầu Xóa Âm thanh", command=self.start_remove_audio).pack(pady=5)

        # Thanh trạng thái dưới cùng
        self.status_bar = tk.Label(self, text="Sẵn sàng", bd=1, relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)

    def select_audio_video(self):
        file_path = filedialog.askopenfilename(filetypes=[("Video files", "*.mp4 *.avi *.mov *.mkv")])
        if file_path:
            self.audio_selected_video_path = file_path
            self.audio_selected_video_label.config(text=os.path.basename(file_path))
    
    def select_video(self, tab='trim_tab'):
        file_path = filedialog.askopenfilename(filetypes=[("Video files", "*.mp4 *.avi *.mov *.mkv")])
        if file_path:
    def select_video(self, tab='trim_tab'):
        file_path = filedialog.askopenfilename(filetypes=[("Video files", "*.mp4 *.avi *.mov *.mkv")])
        if file_path:
            if tab == 'trim_tab':
                self.selected_video_path = file_path
                self.selected_video_label.config(text=os.path.basename(file_path))
            elif tab == 'audio_tab':
                self.audio_selected_video_path = file_path
                self.audio_selected_video_label.config(text=os.path.basename(file_path))
            try:
                from moviepy.editor import VideoFileClip
                clip = VideoFileClip(file_path)
                duration = clip.duration
                self.start_time_label.config(text=f"Bắt đầu: 00:00:00")
                self.end_time_label.config(text=f"Kết thúc: {self.format_time(duration)}")
                clip.close()
            except Exception as e:
                messagebox.showerror(NOTIFICATION_TITLE, f"Không thể đọc thông tin video: {e}")
                if tab == 'trim_tab':
                    self.selected_video_path = None
                    self.selected_video_label.config(text=DEFAULT_VIDEO_SELECTION_LABEL)
                elif tab == 'audio_tab':
                    self.audio_selected_video_path = None
                    self.audio_selected_video_label.config(text=DEFAULT_VIDEO_SELECTION_LABEL)

    def select_output_directory(self):
        output_dir = filedialog.askdirectory()
        if output_dir:
            self.output_directory = output_dir
            self.output_dir_label.config(text=output_dir)

    def update_progress(self, value):
        self.progress_bar['value'] = value
        self.update_idletasks()

    def set_status(self, message):
        self.status_bar.config(text=message)

    def stop_processing(self): 
        self.stop_flag.set()
        self.set_status(PROCESS_STOPPED_MESSAGE)

    def format_time(self, seconds):
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        return f"{h:02}:{m:02}:{s:02}"

    def cut_by_segments(self):
        input_path = self.selected_video_path
        output_dir = self.output_directory
        num_segments_str = self.num_segments_entry.get()

        if not input_path or not output_dir or not num_segments_str:
            messagebox.showwarning(MISSING_INFO_WARNING_TITLE, SELECT_VIDEO_AND_OUTPUT_DIR_WARNING_MESSAGE)
            return

        try:
            num_segments = int(num_segments_str)
            if num_segments <= 0:
                messagebox.showerror(NOTIFICATION_TITLE, "Số lượng đoạn phải là số nguyên dương.")
                return
        except ValueError:
            messagebox.showerror(NOTIFICATION_TITLE, "Số lượng đoạn không hợp lệ. Vui lòng nhập một số nguyên.")
            return

        self.set_status("Đang cắt video theo số lượng...")
        self.progress_bar['value'] = 0
        self.progress_bar['maximum'] = 100 # Sẽ cập nhật lại sau khi có tổng thời lượng

        threading.Thread(target=cut_by_segments, args=(
            input_path, output_dir, num_segments, self.stop_flag, self.update_progress, self.set_status, messagebox
        )).start()

    def cut_by_duration(self):
        input_path = self.selected_video_path
        output_dir = self.output_directory
        segment_duration_str = self.segment_duration_entry.get()

        if not input_path or not output_dir or not segment_duration_str:
            messagebox.showwarning(MISSING_INFO_WARNING_TITLE, SELECT_VIDEO_AND_OUTPUT_DIR_WARNING_MESSAGE)
            return

        try:
            segment_duration = float(segment_duration_str)
            if segment_duration <= 0:
                messagebox.showerror(NOTIFICATION_TITLE, "Thời lượng mỗi đoạn phải là số dương.")
                return
        except ValueError:
            messagebox.showerror(NOTIFICATION_TITLE, "Thời lượng mỗi đoạn không hợp lệ. Vui lòng nhập một số.")
            return

        self.set_status("Đang cắt video theo thời lượng...")
        self.progress_bar['value'] = 0
        self.progress_bar['maximum'] = 100 # Sẽ cập nhật lại sau khi có tổng thời lượng

        threading.Thread(target=cut_by_duration, args=(
            input_path, output_dir, segment_duration, self.stop_flag, self.update_progress, self.set_status, messagebox
        )).start()

    def cut_selected_segment(self):
        input_path = self.selected_video_path
        output_dir = self.output_directory
        start_time_str = self.start_time_entry.get()
        end_time_str = self.end_time_entry.get()

        if not input_path or not output_dir or not start_time_str or not end_time_str:
            messagebox.showwarning(MISSING_INFO_WARNING_TITLE, SELECT_VIDEO_AND_OUTPUT_DIR_WARNING_MESSAGE)
            return

        try:
            start_time = float(start_time_str)
            end_time = float(end_time_str)
        except ValueError:
            messagebox.showerror(NOTIFICATION_TITLE, "Thời gian bắt đầu và kết thúc phải là số.")
            return

        self.set_status("Đang cắt đoạn đã chọn...")
        self.progress_bar['value'] = 0
        self.progress_bar['maximum'] = 100 # Sẽ cập nhật lại sau khi có tổng thời lượng

        threading.Thread(target=cut_selected_segment, args=(
            input_path, output_dir, start_time, end_time, self.stop_flag, self.update_progress, self.set_status, messagebox
        )).start()

    def add_video_to_merge_list(self):
        file_path = filedialog.askopenfilename(filetypes=[("Video files", "*.mp4 *.avi *.mov *.mkv")])
        if file_path:
            self.merge_video_listbox.insert(tk.END, file_path)

    def move_merge_video_up(self):
        selected_indices = self.merge_video_listbox.curselection()
        if not selected_indices: return
        index = selected_indices[0]
        if index > 0:
            text = self.merge_video_listbox.get(index)
            self.merge_video_listbox.delete(index)
            self.merge_video_listbox.insert(index - 1, text)
            self.merge_video_listbox.selection_set(index - 1)

    def move_merge_video_down(self):
        selected_indices = self.merge_video_listbox.curselection()
        if not selected_indices: return
        index = selected_indices[0]
        if index < self.merge_video_listbox.size() - 1:
            text = self.merge_video_listbox.get(index)
            self.merge_video_listbox.delete(index)
            self.merge_video_listbox.insert(index + 1, text)
            self.merge_video_listbox.selection_set(index + 1)

    def remove_selected_merge_video(self):
        selected_indices = self.merge_video_listbox.curselection()
        if not selected_indices: return
        for index in reversed(selected_indices):
            self.merge_video_listbox.delete(index)

    def select_merge_output_directory(self):
        output_dir = filedialog.askdirectory()
        if output_dir:
            self.merge_output_directory = output_dir
            self.merge_output_dir_label.config(text=output_dir)

    def start_merge_videos(self):
        video_paths = list(self.merge_video_listbox.get(0, tk.END))
        output_dir = getattr(self, 'merge_output_directory', None)

        if not video_paths:
            messagebox.showwarning(MISSING_INFO_WARNING_TITLE, "Vui lòng thêm ít nhất một video để ghép.")
            return
        if not output_dir:
            messagebox.showwarning(MISSING_INFO_WARNING_TITLE, "Vui lòng chọn thư mục đầu ra.")
            return

        output_path = os.path.join(output_dir, "merged_video.mp4")

        self.set_status("Đang ghép video...")
        self.progress_bar['value'] = 0
        self.progress_bar['maximum'] = 100

        threading.Thread(target=merge_videos, args=(
            video_paths, output_path, self.stop_flag, self.update_progress, self.set_status, messagebox
        )).start()

    def select_audio_output_directory(self):
        output_dir = filedialog.askdirectory()
        if output_dir:
            self.audio_output_directory = output_dir
            self.audio_output_dir_label.config(text=output_dir)

    def start_remove_audio(self):
        if not hasattr(self, 'audio_selected_video_path') or not self.audio_selected_video_path:
            messagebox.showwarning(MISSING_INFO_WARNING_TITLE, "Vui lòng chọn một video để xóa âm thanh.")
            return
        if not hasattr(self, 'audio_output_directory') or not self.audio_output_directory:
            messagebox.showwarning(MISSING_INFO_WARNING_TITLE, "Vui lòng chọn một thư mục đầu ra cho video không có âm thanh.")
            return
    
        input_path = self.audio_selected_video_path
        output_dir = self.audio_output_directory
        
        try:
            remove_audio(input_path, output_dir)
            messagebox.showinfo(SUCCESS_REMOVE_AUDIO_TITLE, SUCCESS_REMOVE_AUDIO_MESSAGE)
            self.set_status("Đã xóa âm thanh thành công.")
        except Exception as e:
            messagebox.showerror(ERROR_REMOVE_AUDIO_TITLE, ERROR_REMOVE_AUDIO_MESSAGE + f" {str(e)}")
            self.set_status("Xóa âm thanh thất bại.")

if __name__ == "__main__":
    import tkinter as tk
    app = VideoEditorPro()
    app.mainloop()