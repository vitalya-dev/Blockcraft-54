import tkinter as tk
import sys

def show_message_with_selection(message):
    # Create the Tkinter root window
    root = tk.Tk()
    root.overrideredirect(True)  # Remove the title bar (frameless)
    root.attributes("-topmost", True)  # Keep the window on top

    # Create a Text widget (multi-line text box) for displaying the message
    text_widget = tk.Text(root, wrap="word", width=50, height=10, font=("Arial", 12))
    text_widget.pack(padx=10, pady=10)

    # Insert the message into the text widget
    text_widget.insert(tk.END, message)

    # Make the text editable
    text_widget.config(state=tk.NORMAL)  # Ensure the text is editable

    # Make the window follow the mouse position
    mouse_x, mouse_y = root.winfo_pointerxy()  # Get mouse position
    root.geometry(f"+{mouse_x+10}+{mouse_y+10}")  # Slight offset for better visibility

    # Ensure the window gets focus
    root.lift()  # Bring the window to the front
    root.focus_force()  # Force the window to focus

    # Bind ESC key globally to exit the program
    root.bind_all("<Escape>", lambda event: root.quit())  # Capture ESC key globally

    # Run the Tkinter event loop
    root.mainloop()

if __name__ == "__main__":
    # Get the message from command-line arguments
    if len(sys.argv) < 2:
        print("Usage: python3 script.py 'Your message here'")
        sys.exit(1)

    message = sys.argv[1]
    show_message_with_selection(message)
