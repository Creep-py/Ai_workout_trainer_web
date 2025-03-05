import sys
import os
import cv2
import numpy as np
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
    QLabel, QPushButton, QProgressBar, QFrame, QGridLayout, 
    QComboBox, QFileDialog, QSizePolicy
)
from PyQt6.QtCore import Qt, QSize, pyqtSlot, QTimer, QThread, pyqtSignal
from PyQt6.QtGui import QColor, QFont, QPixmap, QIcon, QImage

# Placeholder for MoveNet integration
# In a real implementation, you would import TensorFlow and the MoveNet model
class MoveNetModel:
    """Placeholder for the MoveNet model integration"""
    def __init__(self):
        # In a real implementation, this would load the MoveNet model
        self.keypoints = None
        
    def detect_pose(self, image):
        """
        Placeholder for pose detection
        In a real implementation, this would run the MoveNet model on the image
        """
        # Simulate detecting keypoints
        # In a real implementation, this would return actual keypoints from MoveNet
        # Format: [y, x, score] for each keypoint
        keypoints = np.random.rand(17, 3)
        keypoints[:, 2] = keypoints[:, 2] * 0.8 + 0.2  # Adjust confidence scores to be between 0.2 and 1.0
        self.keypoints = keypoints
        return keypoints
    
    def calculate_angles(self):
        """
        Calculate joint angles based on detected keypoints
        In a real implementation, this would use actual keypoint coordinates
        """
        # Simulate joint angles
        # In a real implementation, this would calculate angles from actual keypoints
        angles = {
            'Hip': 120,
            'Knee': 145,
            'Elbow': 90
        }
        return angles
    
    def calculate_accuracy(self, reference_angles):
        """
        Calculate accuracy compared to reference angles
        In a real implementation, this would compare actual angles with reference
        """
        # Simulate accuracy scores
        # In a real implementation, this would calculate actual accuracy
        accuracy = {
            'Hip': 85,
            'Knee': 45,
            'Elbow': 65,
            'Overall': 85
        }
        return accuracy
    
    def get_feedback(self):
        """
        Generate feedback based on pose comparison
        In a real implementation, this would analyze the pose and provide real feedback
        """
        # Simulate feedback
        # In a real implementation, this would generate actual feedback
        feedback = [
            {'text': 'Knee angle within optimal range', 'status': 'good'},
            {'text': 'Slightly adjust hip position', 'status': 'warning'},
            {'text': 'Keep your back straight', 'status': 'error'}
        ]
        return feedback

class VideoThread(QThread):
    """Thread for processing video frames"""
    frame_update = pyqtSignal(np.ndarray)
    pose_update = pyqtSignal(dict, dict, list, str)
    
    def __init__(self, camera_id=0):
        super().__init__()
        self.camera_id = camera_id
        self.running = False
        self.model = MoveNetModel()
        self.reference_angles = {
            'Hip': 120,
            'Knee': 145,
            'Elbow': 90
        }
        
    def run(self):
        """Main thread function to capture and process video frames"""
        self.running = True
        cap = cv2.VideoCapture(self.camera_id)
        
        while self.running:
            ret, frame = cap.read()
            if not ret:
                break
                
            # Process the frame with MoveNet
            keypoints = self.model.detect_pose(frame)
            
            # Draw keypoints on the frame
            frame = self.draw_keypoints(frame, keypoints)
            
            # Calculate angles and accuracy
            angles = self.model.calculate_angles()
            accuracy = self.model.calculate_accuracy(self.reference_angles)
            feedback = self.model.get_feedback()
            
            # Determine posture status
            overall_accuracy = accuracy['Overall']
            if overall_accuracy >= 80:
                status = 'CORRECT'
            elif overall_accuracy >= 60:
                status = 'ADJUST'
            else:
                status = 'INCORRECT'
            
            # Emit signals with processed data
            self.frame_update.emit(frame)
            self.pose_update.emit(angles, accuracy, feedback, status)
            
            # Sleep to control frame rate
            self.msleep(30)  # ~30 fps
            
        cap.release()
        
    def stop(self):
        """Stop the thread"""
        self.running = False
        self.wait()
        
    def draw_keypoints(self, frame, keypoints):
        """
        Draw keypoints and connections on the frame
        In a real implementation, this would draw actual keypoints from MoveNet
        """
        h, w, _ = frame.shape
        
        # Define keypoint connections (pairs of indices)
        connections = [
            (0, 1), (0, 2), (1, 3), (2, 4),  # Head to shoulders to elbows
            (3, 5), (4, 6),  # Elbows to wrists
            (5, 7), (7, 9), (6, 8), (8, 10),  # Arms to hands
            (5, 6), (5, 11), (6, 12),  # Shoulders to hips
            (11, 12), (11, 13), (12, 14),  # Hips to knees
            (13, 15), (14, 16)  # Knees to ankles
        ]
        
        # Colors for different body parts
        colors = [
            (255, 0, 0),    # Red - Head
            (255, 85, 0),   # Orange - Shoulders
            (255, 170, 0),  # Yellow-Orange - Arms
            (255, 255, 0),  # Yellow - Hands
            (170, 255, 0),  # Yellow-Green - Torso
            (85, 255, 0),   # Light Green - Hips
            (0, 255, 0),    # Green - Upper Legs
            (0, 255, 85),   # Green-Cyan - Lower Legs
            (0, 255, 170),  # Cyan - Feet
        ]
        
        # Draw keypoints
        for i, (y, x, confidence) in enumerate(keypoints):
            if confidence > 0.5:  # Only draw keypoints with confidence > 0.4
                x_px = int(x * w)
                y_px = int(y * h)
                color_idx = min(i // 2, len(colors) - 1)
                cv2.circle(frame, (x_px, y_px), 5, colors[color_idx], -1)
        
        # Draw connections
        for connection in connections:
            start_idx, end_idx = connection
            if (keypoints[start_idx][2] > 0.4 and keypoints[end_idx][2] > 0.4):
                x1 = int(keypoints[start_idx][1] * w)
                y1 = int(keypoints[start_idx][0] * h)
                x2 = int(keypoints[end_idx][1] * w)
                y2 = int(keypoints[end_idx][0] * h)
                color_idx = min(start_idx // 2, len(colors) - 1)
                cv2.line(frame, (x1, y1), (x2, y2), colors[color_idx], 2)
                
        return frame

class CircularProgressBar(QWidget):
    """Custom circular progress bar widget"""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setMinimumSize(150, 150)
        self.value = 85
        self.setStyleSheet("background-color: transparent;")
        
    def setValue(self, value):
        """Set the progress value"""
        self.value = value
        self.update()
        
    def paintEvent(self, event):
        from PyQt6.QtGui import QPainter, QBrush, QPen, QColor
        from PyQt6.QtCore import Qt, QRectF
        import math
        
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        
        # Draw background circle
        pen = QPen(QColor("#2D3748"), 10)
        painter.setPen(pen)
        painter.setBrush(Qt.BrushStyle.NoBrush)
        rect = QRectF(10, 10, self.width() - 20, self.height() - 20)
        painter.drawEllipse(rect)
        
        # Determine color based on value
        if self.value >= 80:
            color = QColor("#48BB78")  # Green
        elif self.value >= 60:
            color = QColor("#ECC94B")  # Yellow
        else:
            color = QColor("#F56565")  # Red
        
        # Draw progress arc
        pen = QPen(color, 10)
        painter.setPen(pen)
        span_angle = int(-self.value * 3.6 * 16)  # Convert to 16th of a degree
        painter.drawArc(rect, 90 * 16, span_angle)
        
        # Draw text
        painter.setPen(QColor("#FFFFFF"))
        painter.setFont(QFont("Arial", 24, QFont.Weight.Bold))
        painter.drawText(rect, Qt.AlignmentFlag.AlignCenter, f"{self.value}%")

class WorkoutTrainerUI(QMainWindow):
    """Main UI class for the AI Workout Trainer application"""
    def __init__(self):
        super().__init__()
        self.initUI()
        self.initCamera()
        
    def initUI(self):
        """Initialize the UI components"""
        # Main window setup
        self.setWindowTitle("AI Workout Trainer")
        self.setMinimumSize(1200, 800)
        self.setStyleSheet("""
            QMainWindow {
                background-color: #121826;
                color: #FFFFFF;
            }
            QLabel {
                color: #FFFFFF;
            }
            QPushButton {
                background-color: #38B2AC;
                color: #FFFFFF;
                border: none;
                border-radius: 4px;
                padding: 8px 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #319795;
            }
            QComboBox {
                background-color: #1A202C;
                color: #FFFFFF;
                border: 1px solid #2D3748;
                border-radius: 4px;
                padding: 8px;
                min-width: 150px;
            }
            QComboBox::drop-down {
                border: none;
            }
            QComboBox QAbstractItemView {
                background-color: #1A202C;
                color: #FFFFFF;
                selection-background-color: #38B2AC;
            }
            QProgressBar {
                background-color: #2D3748;
                color: #FFFFFF;
                border-radius: 5px;
                text-align: center;
            }
            QProgressBar::chunk {
                background-color: #38B2AC;
                border-radius: 5px;
            }
        """)
        
        # Create central widget and main layout
        central_widget = QWidget()
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        self.setCentralWidget(central_widget)
        
        # Header
        header_frame = QFrame()
        header_frame.setStyleSheet("background-color: #1A202C; border-bottom: 1px solid #2D3748;")
        header_layout = QHBoxLayout(header_frame)
        
        title_label = QLabel("AI Workout Trainer")
        title_label.setStyleSheet("font-size: 24px; font-weight: bold; color: #38B2AC;")
        
        self.exercise_combo = QComboBox()
        self.exercise_combo.addItems(["Squats", "Push-ups", "Lunges"])
        self.exercise_combo.currentTextChanged.connect(self.change_exercise)
        
        header_layout.addWidget(title_label)
        header_layout.addStretch()
        header_layout.addWidget(self.exercise_combo)
        
        main_layout.addWidget(header_frame)
        
        # Content area
        content_widget = QWidget()
        content_layout = QGridLayout(content_widget)
        content_layout.setContentsMargins(16, 16, 16, 16)
        content_layout.setSpacing(16)
        
        # Trainer video section
        trainer_frame = self.create_panel()
        trainer_layout = QVBoxLayout(trainer_frame)
        
        self.upload_button = QPushButton("Click to Upload Trainer Video")
        self.upload_button.setIcon(QIcon.fromTheme("document-open"))
        self.upload_button.clicked.connect(self.upload_trainer_video)
        
        self.trainer_video_area = QLabel()
        self.trainer_video_area.setStyleSheet("background-color: #0D1117; border-radius: 8px;")
        self.trainer_video_area.setMinimumHeight(300)
        self.trainer_video_area.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.trainer_video_area.setText("Trainer Video Preview")
        self.trainer_video_area.setStyleSheet("color: #A0AEC0; background-color: #0D1117; border-radius: 8px;")
        
        # Video controls
        controls_layout = QHBoxLayout()
        
        self.play_button = QPushButton("Play")
        self.play_button.clicked.connect(self.play_video)
        
        self.pause_button = QPushButton("Pause")
        self.pause_button.clicked.connect(self.pause_video)
        
        self.prev_button = QPushButton("<<")
        self.prev_button.clicked.connect(self.prev_frame)
        
        self.next_button = QPushButton(">>")
        self.next_button.clicked.connect(self.next_frame)
        
        controls_layout.addWidget(self.play_button)
        controls_layout.addWidget(self.pause_button)
        controls_layout.addWidget(self.prev_button)
        controls_layout.addWidget(self.next_button)
        
        trainer_layout.addWidget(self.upload_button, alignment=Qt.AlignmentFlag.AlignCenter)
        trainer_layout.addWidget(self.trainer_video_area)
        trainer_layout.addLayout(controls_layout)
        
        # Trainee video section
        trainee_frame = self.create_panel()
        trainee_layout = QVBoxLayout(trainee_frame)
        
        trainee_label = QLabel("Position yourself in front of the camera")
        trainee_label.setStyleSheet("color: #38B2AC;")
        
        self.trainee_video_area = QLabel()
        self.trainee_video_area.setStyleSheet("background-color: #0D1117; border-radius: 8px;")
        self.trainee_video_area.setMinimumHeight(300)
        self.trainee_video_area.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.trainee_video_area.setText("Position yourself in front of the camera")
        self.trainee_video_area.setStyleSheet("color: #A0AEC0; background-color: #0D1117; border-radius: 8px;")
        
        self.reset_button = QPushButton("Reset")
        self.reset_button.setIcon(QIcon.fromTheme("view-refresh"))
        self.reset_button.clicked.connect(self.reset_camera)
        
        trainee_layout.addWidget(trainee_label)
        trainee_layout.addWidget(self.trainee_video_area)
        trainee_layout.addWidget(self.reset_button)
        
        # Posture accuracy section
        posture_frame = self.create_panel()
        posture_layout = QVBoxLayout(posture_frame)
        
        posture_title = QLabel("Posture Accuracy")
        posture_title.setStyleSheet("font-size: 18px; font-weight: bold;")
        
        # Using circular progress bar for posture accuracy
        self.accuracy_widget = CircularProgressBar()
        
        status_title = QLabel("Posture Status")
        status_title.setStyleSheet("font-size: 18px; font-weight: bold; text-align: center;")
        status_title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        self.status_value = QLabel("CORRECT")
        self.status_value.setStyleSheet("font-size: 24px; font-weight: bold; color: #48BB78; text-align: center;")
        self.status_value.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        posture_layout.addWidget(posture_title)
        posture_layout.addWidget(self.accuracy_widget, alignment=Qt.AlignmentFlag.AlignCenter)
        posture_layout.addWidget(status_title)
        posture_layout.addWidget(self.status_value)
        
        # Joint angles section
        angles_frame = self.create_panel()
        angles_layout = QVBoxLayout(angles_frame)
        
        angles_header = QHBoxLayout()
        angles_title = QLabel("Joint Angles")
        angles_title.setStyleSheet("font-size: 18px; font-weight: bold;")
        accuracy_title = QLabel("Accuracy")
        accuracy_title.setStyleSheet("font-size: 18px; font-weight: bold;")
        
        angles_header.addWidget(angles_title)
        angles_header.addStretch()
        angles_header.addWidget(accuracy_title)
        
        angles_layout.addLayout(angles_header)
        
        # Joint angle items
        self.joint_labels = {}
        self.joint_accuracy_labels = {}
        self.joint_progress_bars = {}
        
        joint_data = [
            ("Hip", 120, 85),
            ("Knee", 145, 45),
            ("Elbow", 90, 65)
        ]
        
        for joint, angle, accuracy in joint_data:
            joint_layout = QHBoxLayout()
            
            joint_label = QLabel(f"{joint}: {angle}°")
            accuracy_label = QLabel(f"{joint}: {accuracy}%")
            
            self.joint_labels[joint] = joint_label
            self.joint_accuracy_labels[joint] = accuracy_label
            
            joint_layout.addWidget(joint_label)
            joint_layout.addStretch()
            joint_layout.addWidget(accuracy_label)
            
            angles_layout.addLayout(joint_layout)
            
            progress = QProgressBar()
            progress.setValue(accuracy)
            progress.setTextVisible(False)
            progress.setFixedHeight(10)
            
            # Set color based on accuracy
            if accuracy > 80:
                progress.setStyleSheet("QProgressBar::chunk { background-color: #48BB78; }")
            elif accuracy > 50:
                progress.setStyleSheet("QProgressBar::chunk { background-color: #ECC94B; }")
            else:
                progress.setStyleSheet("QProgressBar::chunk { background-color: #F56565; }")
                
            self.joint_progress_bars[joint] = progress
            angles_layout.addWidget(progress)
            angles_layout.addSpacing(10)
        
        # Posture feedback section
        feedback_frame = self.create_panel()
        self.feedback_layout = QVBoxLayout(feedback_frame)
        
        feedback_title = QLabel("Posture Feedback")
        feedback_title.setStyleSheet("font-size: 18px; font-weight: bold;")
        self.feedback_layout.addWidget(feedback_title)
        
        # Feedback items will be added dynamically
        self.update_feedback([
            {'text': 'Knee angle within optimal range', 'status': 'good'},
            {'text': 'Slightly adjust hip position', 'status': 'warning'},
            {'text': 'Keep your back straight', 'status': 'error'}
        ])
        
        # Add all panels to the grid layout
        content_layout.addWidget(trainer_frame, 0, 0)
        content_layout.addWidget(trainee_frame, 0, 1)
        content_layout.addWidget(posture_frame, 1, 0)
        content_layout.addWidget(angles_frame, 1, 1)
        content_layout.addWidget(feedback_frame, 2, 0, 1, 2)
        
        main_layout.addWidget(content_widget)
        
        # Initialize trainer video variables
        self.trainer_video = None
        self.trainer_video_path = None
        self.trainer_video_playing = False
        self.current_frame = 0
        self.total_frames = 0
        
    def create_panel(self):
        """Helper method to create a styled panel"""
        panel = QFrame()
        panel.setStyleSheet("""
            background-color: #1A202C;
            border-radius: 8px;
            padding: 16px;
        """)
        return panel
    
    def initCamera(self):
        """Initialize the camera thread"""
        self.video_thread = VideoThread()
        self.video_thread.frame_update.connect(self.update_trainee_frame)
        self.video_thread.pose_update.connect(self.update_pose_data)
        self.video_thread.start()
        
    @pyqtSlot(np.ndarray)
    def update_trainee_frame(self, frame):
        """Update the trainee video display with the latest frame"""
        # Convert the frame from BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb_frame.shape
        
        # Convert the frame to QImage
        bytes_per_line = ch * w
        image = QImage(rgb_frame.data, w, h, bytes_per_line, QImage.Format.Format_RGB888)
        
        # Scale the image to fit the label while maintaining aspect ratio
        pixmap = QPixmap.fromImage(image)
        self.trainee_video_area.setPixmap(pixmap.scaled(
            self.trainee_video_area.width(),
            self.trainee_video_area.height(),
            Qt.AspectRatioMode.KeepAspectRatio
        ))
        
    @pyqtSlot(dict, dict, list, str)
    def update_pose_data(self, angles, accuracy, feedback, status):
        """Update the UI with the latest pose data"""
        # Update joint angles
        for joint, angle in angles.items():
            if joint in self.joint_labels:
                self.joint_labels[joint].setText(f"{joint}: {angle}°")
                
        # Update accuracy
        for joint, acc in accuracy.items():
            if joint == 'Overall':
                self.accuracy_widget.setValue(acc)
            elif joint in self.joint_accuracy_labels:
                self.joint_accuracy_labels[joint].setText(f"{joint}: {acc}%")
                self.joint_progress_bars[joint].setValue(acc)
                
                # Update progress bar color
                if acc > 80:
                    self.joint_progress_bars[joint].setStyleSheet("QProgressBar::chunk { background-color: #48BB78; }")
                elif acc > 50:
                    self.joint_progress_bars[joint].setStyleSheet("QProgressBar::chunk { background-color: #ECC94B; }")
                else:
                    self.joint_progress_bars[joint].setStyleSheet("QProgressBar::chunk { background-color: #F56565; }")
        
        # Update status
        self.status_value.setText(status)
        if status == 'CORRECT':
            self.status_value.setStyleSheet("font-size: 24px; font-weight: bold; color: #48BB78; text-align: center;")
        elif status == 'ADJUST':
            self.status_value.setStyleSheet("font-size: 24px; font-weight: bold; color: #ECC94B; text-align: center;")
        else:
            self.status_value.setStyleSheet("font-size: 24px; font-weight: bold; color: #F56565; text-align: center;")
            
        # Update feedback
        self.update_feedback(feedback)
        
    def update_feedback(self, feedback_items):
        """Update the feedback section with new items"""
        # Clear existing feedback items (except the title)
        for i in reversed(range(1, self.feedback_layout.count())):
            item = self.feedback_layout.itemAt(i)
            if item.layout():
                # If it's a layout, remove all its widgets
                while item.layout().count():
                    child = item.layout().takeAt(0)
                    if child.widget():
                        child.widget().deleteLater()
                # Remove the layout itself
                self.feedback_layout.removeItem(item)
            elif item.widget():
                item.widget().deleteLater()
                
        # Add new feedback items
        for item in feedback_items:
            item_layout = QHBoxLayout()
            
            indicator = QLabel("●")
            if item['status'] == 'good':
                indicator.setStyleSheet("color: #48BB78; font-size: 16px;")
            elif item['status'] == 'warning':
                indicator.setStyleSheet("color: #ECC94B; font-size: 16px;")
            else:
                indicator.setStyleSheet("color: #F56565; font-size: 16px;")
                
            text_label = QLabel(item['text'])
            
            item_layout.addWidget(indicator)
            item_layout.addWidget(text_label)
            item_layout.addStretch()
            
            self.feedback_layout.addLayout(item_layout)
            
    @pyqtSlot()
    def upload_trainer_video(self):
        """Handle trainer video upload"""
        file_name, _ = QFileDialog.getOpenFileName(
            self,
            "Open Video File",
            "",
            "Video Files (*.mp4 *.avi *.mov *.wmv)"
        )
        
        if file_name:
            self.trainer_video_path = file_name
            self.trainer_video = cv2.VideoCapture(file_name)
            self.total_frames = int(self.trainer_video.get(cv2.CAP_PROP_FRAME_COUNT))
            self.current_frame = 0
            
            # Display the first frame
            self.show_trainer_frame()
            
    def show_trainer_frame(self):
        """Display the current frame of the trainer video"""
        if self.trainer_video and self.trainer_video.isOpened():
            self.trainer_video.set(cv2.CAP_PROP_POS_FRAMES, self.current_frame)
            ret, frame = self.trainer_video.read()
            
            if ret:
                # Convert the frame from BGR to RGB
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                h, w, ch = rgb_frame.shape
                
                # Convert the frame to QImage
                bytes_per_line = ch * w
                image = QImage(rgb_frame.data, w, h, bytes_per_line, QImage.Format.Format_RGB888)
                
                # Scale the image to fit the label while maintaining aspect ratio
                pixmap = QPixmap.fromImage(image)
                self.trainer_video_area.setPixmap(pixmap.scaled(
                    self.trainer_video_area.width(),
                    self.trainer_video_area.height(),
                    Qt.AspectRatioMode.KeepAspectRatio
                ))
            else:
                # If we've reached the end of the video, reset to the beginning
                self.current_frame = 0
                self.trainer_video_playing = False
                
    @pyqtSlot()
    def play_video(self):
        """Play the trainer video"""
        if self.trainer_video and self.trainer_video.isOpened():
            self.trainer_video_playing = True
            
            # Use a timer to advance frames
            self.play_timer = QTimer(self)
            self.play_timer.timeout.connect(self.next_frame)
            self.play_timer.start(33)  # ~30 fps
            
    @pyqtSlot()
    def pause_video(self):
        """Pause the trainer video"""
        self.trainer_video_playing = False
        if hasattr(self, 'play_timer'):
            self.play_timer.stop()
            
    @pyqtSlot()
    def next_frame(self):
        """Advance to the next frame"""
        if self.trainer_video and self.trainer_video.isOpened():
            self.current_frame = (self.current_frame + 1) % self.total_frames
            self.show_trainer_frame()
            
    @pyqtSlot()
    def prev_frame(self):
        """Go back to the previous frame"""
        if self.trainer_video and self.trainer_video.isOpened():
            self.current_frame = (self.current_frame - 1) % self.total_frames
            self.show_trainer_frame()
            
    @pyqtSlot()
    def reset_camera(self):
        """Reset the camera feed"""
        if self.video_thread.isRunning():
            self.video_thread.stop()
            
        # Restart the video thread
        self.video_thread = VideoThread()
        self.video_thread.frame_update.connect(self.update_trainee_frame)
        self.video_thread.pose_update.connect(self.update_pose_data)
        self.video_thread.start()
        
    @pyqtSlot(str)
    def change_exercise(self, exercise):
        """Change the current exercise"""
        print(f"Changed exercise to: {exercise}")
        # In a real implementation, this would load reference poses for the selected exercise
        
    def closeEvent(self, event):
        """Handle window close event"""
        # Stop the video thread when the window is closed
        if self.video_thread.isRunning():
            self.video_thread.stop()
        event.accept()

def main():
    app = QApplication(sys.argv)
    window = WorkoutTrainerUI()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()