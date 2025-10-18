import os
from flask import (
    Flask, render_template, request, redirect,
    url_for, send_from_directory, flash
)
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"mp4", "webm", "ogg", "mov", "mkv"}

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.secret_key = "change-this-to-a-random-secret-in-prod"

# Ensure upload folder exists
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/")
def index():
    # interactive questions page
    return render_template("index.html")


@app.route("/birthday")
def birthday():
    # splash / birthday page
    return render_template("birthday.html")


@app.route("/theater", methods=["GET", "POST"])
def theater():
    """
    GET: show the theater page and allow uploading a video (client-side)
    POST: handle video upload (optional). Saved to uploads/ and then displayed.
    """
    video_filename = None
    if request.method == "POST":
        if "video" not in request.files:
            flash("No file part")
            return redirect(request.url)
        file = request.files["video"]
        if file.filename == "":
            flash("No selected file")
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(save_path)
            video_filename = filename
            # redirect to GET so reloading doesn't resubmit the form
            return redirect(url_for("theater", v=video_filename))
        else:
            flash("Unsupported file type. Allowed: " + ", ".join(ALLOWED_EXTENSIONS))
            return redirect(request.url)

    # If user provided a query param ?v=filename show it
    v = request.args.get("v")
    if v and allowed_file(v) and os.path.exists(os.path.join(app.config["UPLOAD_FOLDER"], v)):
        video_filename = v

    return render_template("theater.html", video_filename=video_filename)


@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    """Serve uploaded video files (development only)."""
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


@app.route("/credits")
def credits():
    # final letter / credits
    # you can also read from a file if you want later
    return render_template("credits.html")


if __name__ == "__main__":
    # run in debug for local dev
    app.run(host="127.0.0.1", port=5000, debug=True)
