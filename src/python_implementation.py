import sys
import os
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
    QLabel, QPushButton, QProgressBar, QFrame, QGridLayout, 
    QComboBox, QFileDialog, QSizePolicy
)
from PyQt6.QtCore import Qt, QSize, pyqtSlot, QTimer
from PyQt6.QtGui import QColor, QFont, QPixmap, QIcon

class CircularProgressBar(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setMinimumSize(150, 150)
        self.value = 85
        self.setStyleSheet("background-color: transparent;")
        
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
        
        # Draw progress arc
        pen = QPen(QColor("#38B2AC"), 10)
        painter.setPen(pen)
        span_angle = int(-self.value * 3.6 * 16)  # Convert to 16th of a degree
        painter.drawArc(rect, 90 * 16, span_angle)
        
        # Draw text
        painter.setPen(QColor("#FFFFFF"))
        painter.setFont(QFont("Arial", 24, QFont.Weight.Bold))
        painter.drawText(rect, Qt.AlignmentFlag.AlignCenter, f"{self.value}%")

class WorkoutTrainerUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.initUI()
        
    def initUI(self):
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
        
        exercise_combo = QComboBox()
        exercise_combo.addItems(["Squats", "Push-ups", "Lunges"])
        
        header_layout.addWidget(title_label)
        header_layout.addStretch()
        header_layout.addWidget(exercise_combo)
        
        main_layout.addWidget(header_frame)
        
        # Content area
        content_widget = QWidget()
        content_layout = QGridLayout(content_widget)
        content_layout.setContentsMargins(16, 16, 16, 16)
        content_layout.setSpacing(16)
        
        # Trainer video section
        trainer_frame = self.create_panel()
        trainer_layout = QVBoxLayout(trainer_frame)
        
        upload_button = QPushButton("Click to Upload Trainer Video")
        upload_button.setIcon(QIcon.fromTheme("document-open"))
        upload_button.clicked.connect(self.upload_trainer_video)
        
        trainer_video_area = QFrame()
        trainer_video_area.setStyleSheet("background-color: #0D1117; border-radius: 8px;")
        trainer_video_area.setMinimumHeight(300)
        trainer_video_layout = QVBoxLayout(trainer_video_area)
        
        trainer_placeholder = QLabel("Trainer Video Preview")
        trainer_placeholder.setAlignment(Qt.AlignmentFlag.AlignCenter)
        trainer_placeholder.setStyleSheet("color: #A0AEC0;")
        trainer_video_layout.addWidget(trainer_placeholder)
        
        # Video controls
        controls_layout = QHBoxLayout()
        
        play_button = QPushButton("Play")
        pause_button = QPushButton("Pause")
        prev_button = QPushButton("<<")
        next_button = QPushButton(">>")
        
        controls_layout.addWidget(play_button)
        controls_layout.addWidget(pause_button)
        controls_layout.addWidget(prev_button)
        controls_layout.addWidget(next_button)
        
        trainer_layout.addWidget(upload_button, alignment=Qt.AlignmentFlag.AlignCenter)
        trainer_layout.addWidget(trainer_video_area)
        trainer_layout.addLayout(controls_layout)
        
        # Trainee video section
        trainee_frame = self.create_panel()
        trainee_layout = QVBoxLayout(trainee_frame)
        
        trainee_label = QLabel("Position yourself in front of the camera")
        trainee_label.setStyleSheet("color: #38B2AC;")
        
        trainee_video_area = QFrame()
        trainee_video_area.setStyleSheet("background-color: #0D1117; border-radius: 8px;")
        trainee_video_area.setMinimumHeight(300)
        trainee_video_layout = QVBoxLayout(trainee_video_area)
        
        trainee_placeholder = QLabel("Position yourself in front of the camera")
        trainee_placeholder.setAlignment(Qt.AlignmentFlag.AlignCenter)
        trainee_placeholder.setStyleSheet("color: #A0AEC0;")
        trainee_video_layout.addWidget(trainee_placeholder)
        
        reset_button = QPushButton("Reset")
        reset_button.setIcon(QIcon.fromTheme("view-refresh"))
        
        trainee_layout.addWidget(trainee_label)
        trainee_layout.addWidget(trainee_video_area)
        trainee_layout.addWidget(reset_button)
        
        # Posture accuracy section
        posture_frame = self.create_panel()
        posture_layout = QVBoxLayout(posture_frame)
        
        posture_title = QLabel("Posture Accuracy")
        posture_title.setStyleSheet("font-size: 18px; font-weight: bold;")
        
        # Using circular progress bar for posture accuracy
        accuracy_widget = CircularProgressBar()
        
        status_title = QLabel("Posture Status")
        status_title.setStyleSheet("font-size: 18px; font-weight: bold; text-align: center;")
        status_title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        status_value = QLabel("CORRECT")
        status_value.setStyleSheet("font-size: 24px; font-weight: bold; color: #48BB78; text-align: center;")
        status_value.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        posture_layout.addWidget(posture_title)
        posture_layout.addWidget(accuracy_widget, alignment=Qt.AlignmentFlag.AlignCenter)
        posture_layout.addWidget(status_title)
        posture_layout.addWidget(status_value)
        
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
        joint_data = [
            ("Hip", 120, 85),
            ("Knee", 145, 45),
            ("Elbow", 90, 65)
        ]
        
        for joint, angle, accuracy in joint_data:
            joint_layout = QHBoxLayout()
            
            joint_label = QLabel(f"{joint}: {angle}°")
            accuracy_label = QLabel(f"{joint}: {accuracy}%")
            
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
                
            angles_layout.addWidget(progress)
            angles_layout.addSpacing(10)
        
        # Posture feedback section
        feedback_frame = self.create_panel()
        feedback_layout = QVBoxLayout(feedback_frame)
        
        feedback_title = QLabel("Posture Feedback")
        feedback_title.setStyleSheet("font-size: 18px; font-weight: bold;")
        feedback_layout.addWidget(feedback_title)
        
        feedback_items = [
            ("Knee angle within optimal range", "good"),
            ("Slightly adjust hip position", "warning"),
            ("Keep your back straight", "error")
        ]
        
        for text, status in feedback_items:
            item_layout = QHBoxLayout()
            
            indicator = QLabel("●")
            if status == "good":
                indicator.setStyleSheet("color: #48BB78; font-size: 16px;")
            elif status == "warning":
                indicator.setStyleSheet("color: #ECC94B; font-size: 16px;")
            else:
                indicator.setStyleSheet("color: #F56565; font-size: 16px;")
                
            text_label = QLabel(text)
            
            item_layout.addWidget(indicator)
            item_layout.addWidget(text_label)
            item_layout.addStretch()
            
            feedback_layout.addLayout(item_layout)
        
        # Add all panels to the grid layout
        content_layout.addWidget(trainer_frame, 0, 0)
        content_layout.addWidget(trainee_frame, 0, 1)
        content_layout.addWidget(posture_frame, 1, 0)
        content_layout.addWidget(angles_frame, 1, 1)
        content_layout.addWidget(feedback_frame, 2, 0, 1, 2)
        
        main_layout.addWidget(content_widget)
        
    def create_panel(self):
        """Helper method to create a styled panel"""
        panel = QFrame()
        panel.setStyleSheet("""
            background-color: #1A202C;
            border-radius: 8px;
            padding: 16px;
        """)
        return panel
        
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
            # Here you would implement video loading logic
            print(f"Selected video: {file_name}")
            
            # For demonstration, we'd update the UI to show the video is loaded
            # In a real implementation, you would use a video player widget

def main():
    app = QApplication(sys.argv)
    window = WorkoutTrainerUI()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()