import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import threading
import os
from video_processing.video_cutter import cut_by_segments, cut_by_duration, cut_selected_segment
from video_processing.video_merger import merge_videos
from gui.constants import (
    START_TIME_LABEL,
    SELECT_OUTPUT_DIR_BUTTON_TEXT,
    OUTPUT_DIR_NOT_SELECTED_LABEL,
    MISSING_INFO_WARNING_TITLE,
    SELECT_VIDEO_AND_OUTPUT_DIR_WARNING_MESSAGE,
    PROCESS_STOPPED_MESSAGE,
    NOTIFICATION_TITLE,
    COMPLETED_TITLE
)

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
        self.style.configure('TLabel', background='#F0F0F0', font=('Segoe UI', 10))
        self.style.configure('TButton', font=('Segoe UI', 10))
        self.style.configure('TEntry', font=('Segoe UI', 10))
        self.style.configure('TCheckbutton', background='#F0F0F0', font=('Segoe UI', 10))
        self.style.configure('TRadiobutton', background='#F0F0F0', font=('Segoe UI', 10))
        self.style.configure('TNotebook', background='#F0F0F0')
        self.style.configure('TNotebook.Tab', background='#E0E0E0', font=('Segoe UI', 10))
        self.style.map('TNotebook.Tab', background=[('selected', '#FFFFFF')])

        # Font Segoe UI, cỡ chữ 10-11pt
        self.style.configure('TLabelFrame', font=('Segoe UI', 11, 'bold'), background='#F0F0F0', relief='flat')
        self.style.configure('TLabelframe.Label', background='#F0F0F0', font=('Segoe UI', 11, 'bold'))



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
        self.selected_video_label = ttk.Label(select_video_frame, text="Chưa có tệp nào được chọn.")
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
        ttk.Label(cut_mode_grid, text="Số lượng đoạn:").grid(row=0, column=0, sticky="w", padx=5, pady=2)
        self.num_segments_entry = ttk.Entry(cut_mode_grid, width=10)
        self.num_segments_entry.grid(row=0, column=1, sticky="w", padx=5, pady=2)
        ttk.Button(cut_mode_grid, text="Cắt theo số lượng", command=self.cut_by_segments).grid(row=0, column=2, sticky="w", padx=5, pady=2)

        # Cắt theo thời lượng
        ttk.Label(cut_mode_grid, text="Thời lượng mỗi đoạn (giây):").grid(row=1, column=0, sticky="w", padx=5, pady=2)
        self.segment_duration_entry = ttk.Entry(cut_mode_grid, width=10)
        self.segment_duration_entry.grid(row=1, column=1, sticky="w", padx=5, pady=2)
        ttk.Button(cut_mode_grid, text="Cắt theo thời lượng", command=self.cut_by_duration).grid(row=1, column=2, sticky="w", padx=5, pady=2)

        # Cắt thủ công
        ttk.Button(cut_mode_grid, text="✂ Cắt đoạn đã chọn", command=self.cut_selected_segment).grid(row=0, column=3, sticky="w", padx=5, pady=2)

        # Khu vực lưu trữ & xuất video
        output_frame = ttk.LabelFrame(self.trim_tab, text="Lưu trữ & Xuất Video")
        output_frame.pack(padx=10, pady=10, fill="x")

        output_dir_frame = ttk.Frame(output_frame)
        output_dir_frame.pack(fill="x", padx=5, pady=5)
        ttk.Button(output_dir_frame, text=SELECT_OUTPUT_DIR_BUTTON_TEXT, command=self.select_output_directory).pack(side="left")
        self.output_dir_label = ttk.Label(output_dir_frame, text=OUTPUT_DIR_NOT_SELECTED_LABEL)
        self.output_dir_label.pack(side="left", padx=5)

        self.progress_bar = ttk.Progressbar(output_frame, orient="horizontal", length=300, mode="determinate")
        self.progress_bar.pack(fill="x", padx=5, pady=5)
        ttk.Button(cut_mode_grid, text="⏹ Dừng Cắt", command=self.stop_processing).grid(row=2, column=2, sticky="w", padx=5, pady=2)

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

        ttk.Button(audio_select_video_frame, text="📂 Chọn Video").pack(side="left")
        self.audio_selected_video_label = ttk.Label(audio_select_video_frame, text="Chưa có tệp nào được chọn.")
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

    def set_status(self, message):
        self.status_bar.config(text=message)

    def format_time(self, seconds):
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        return f"{h:02}:{m:02}:{s:02}"

    def select_video(self):
        file_path = filedialog.askopenfilename(
            filetypes=[("Video files", "*.mp4 *.avi *.mov *.mkv")]
        )
        if file_path:
            self.selected_video_label.config(text=file_path)
            try:
                clip = VideoFileClip(file_path)
                duration = clip.duration
                self.set_status(f"Đã chọn video: {file_path} (Thời lượng: {self.format_time(duration)})")
                self.start_time_label.config(text=START_TIME_LABEL)
                self.end_time_label.config(text=f"Kết thúc: {self.format_time(duration)}")
            except Exception as e:
                self.set_status(f"Lỗi đọc video: {e}")
                self.start_time_label.config(text=START_TIME_LABEL)
                self.end_time_label.config(text="Kết thúc: 00:00:00")

    def select_output_directory(self):
        dir_path = filedialog.askdirectory()
        if dir_path:
            self.output_dir_label.config(text=dir_path)
            self.set_status(f"Đã chọn thư mục lưu: {dir_path}")
    def stop_processing(self):
        self.stop_flag.set()
        self.set_status(PROCESS_STOPPED_MESSAGE)
        messagebox.showinfo(NOTIFICATION_TITLE, PROCESS_STOPPED_MESSAGE)

    def update_progress(self, value):
        self.progress_bar['value'] = value
        self.update_idletasks()

    def cut_by_segments(self):
        input_path = self.selected_video_label.cget("text")
        output_dir = self.output_dir_label.cget("text")
        if not input_path or not output_dir:
            messagebox.showwarning(MISSING_INFO_WARNING_TITLE, SELECT_VIDEO_AND_OUTPUT_DIR_WARNING_MESSAGE)
            return

        try:
            num_segments = int(self.num_segments_entry.get())
            if num_segments <= 0:
                raise ValueError("Số lượng đoạn phải lớn hơn 0.")
            
            threading.Thread(target=cut_by_segments, args=(input_path, output_dir, num_segments, self.stop_flag, self.update_progress, self.set_status, messagebox)).start()

        except ValueError as e:
            messagebox.showerror("Lỗi", str(e))

    def cut_by_duration(self):
        input_path = self.selected_video_label.cget("text")
        output_dir = self.output_dir_label.cget("text")
        if not input_path or not output_dir:
            messagebox.showwarning(MISSING_INFO_WARNING_TITLE, SELECT_VIDEO_AND_OUTPUT_DIR_WARNING_MESSAGE)
            return

        try:
            segment_duration = float(self.segment_duration_entry.get())
            if segment_duration <= 0:
                raise ValueError("Thời lượng mỗi đoạn phải lớn hơn 0.")
            
            threading.Thread(target=cut_by_duration, args=(input_path, output_dir, segment_duration, self.stop_flag, self.update_progress, self.set_status, messagebox)).start()

        except ValueError as e:
            messagebox.showerror("Lỗi", str(e))

    def cut_selected_segment(self):
        input_path = self.selected_video_label.cget("text")
        output_dir = self.output_dir_label.cget("text")
        if not input_path or not output_dir:
            messagebox.showwarning(MISSING_INFO_WARNING_TITLE, SELECT_VIDEO_AND_OUTPUT_DIR_WARNING_MESSAGE)
            return

        try:
            threading.Thread(target=cut_selected_segment, args=(input_path, output_dir, self.stop_flag, self.update_progress, self.set_status, messagebox)).start()
        except Exception as e:
            messagebox.showerror("Lỗi", str(e))

    def select_merge_output_directory(self):
        dir_path = filedialog.askdirectory()
        if dir_path:
            self.merge_output_dir_label.config(text=dir_path)
            self.set_status(f"Đã chọn thư mục lưu (Ghép): {dir_path}")

    def start_merge_videos(self):
        input_paths = list(self.merge_video_listbox.get(0, tk.END))
        output_dir = self.merge_output_dir_label.cget("text")
        if not input_paths or not output_dir or output_dir == OUTPUT_DIR_NOT_SELECTED_LABEL:
            messagebox.showwarning(MISSING_INFO_WARNING_TITLE, "Vui lòng chọn video và thư mục lưu (Ghép Video).")
            return
        output_path = os.path.join(output_dir, "merged_video.mp4")
        threading.Thread(target=merge_videos, args=(input_paths, output_path, self.stop_flag, self.update_progress, self.set_status, messagebox)).start()

    def select_audio_output_directory(self):
        dir_path = filedialog.askdirectory()
        if dir_path:
            self.audio_output_dir_label.config(text=dir_path)
            self.set_status(f"Đã chọn thư mục lưu (Xóa Âm thanh): {dir_path}")

    def start_remove_audio(self):
        # TODO: Thêm logic xử lý xóa âm thanh khi có module xử lý
        messagebox.showinfo(NOTIFICATION_TITLE, "Chức năng xóa âm thanh sẽ được cập nhật.")

    def add_video_to_merge_list(self):
        file_paths = filedialog.askopenfilenames(
            filetypes=[("Video files", "*.mp4 *.avi *.mov *.mkv")]
        )
        for path in file_paths:
            if path and path not in self.merge_video_listbox.get(0, tk.END):
                self.merge_video_listbox.insert(tk.END, path)

    def move_merge_video_up(self):
        selection = self.merge_video_listbox.curselection()
        if not selection or selection[0] == 0:
            return
        idx = selection[0]
        value = self.merge_video_listbox.get(idx)
        self.merge_video_listbox.delete(idx)
        self.merge_video_listbox.insert(idx - 1, value)
        self.merge_video_listbox.selection_set(idx - 1)

    def move_merge_video_down(self):
        selection = self.merge_video_listbox.curselection()
        if not selection or selection[0] == self.merge_video_listbox.size() - 1:
            return
        idx = selection[0]
        value = self.merge_video_listbox.get(idx)
        self.merge_video_listbox.delete(idx)
        self.merge_video_listbox.insert(idx + 1, value)
        self.merge_video_listbox.selection_set(idx + 1)

    def remove_selected_merge_video(self):
        selection = self.merge_video_listbox.curselection()
        for idx in reversed(selection):
            self.merge_video_listbox.delete(idx)


if __name__ == "__main__":
    app = VideoEditorPro()
    app.mainloop()