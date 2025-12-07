// components/zoo-photo-booth.js
class ZooPhotoBooth extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._stream = null;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("../styles.css", import.meta.url).href;
    this.shadowRoot.append(link);

    // Set up the audio snap
    const defaultSrc = new URL("./snap.mp3", import.meta.url).href;
    this._audio = new Audio(this.getAttribute("sound-src") || defaultSrc);
    this._audio.preload = "auto";
  }

attributeChangedCallback(name, _old, val) {
    if (name === "sound-src" && this._audio) this._audio.src = val || "./snap.mp3";
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <div class="row">
        <video id="video" playsinline></video>
        <canvas id="canvas" width="320" height="240"></canvas>
        <img id="preview" class="preview" alt="Snapshot preview" style="display:none"/>
      </div>

      <div class="row controls">
        <button id="start">Start Camera</button>
        <button id="capture" class="secondary" disabled>Take Photo</button>
        <button id="retake" class="ghost" disabled>Retake</button>
        <button id="use" class="secondary" disabled>Use Photo</button>

        <input id="file" type="file" accept="image/*" capture="user">
        <label class="file-btn" for="file">Upload instead</label>
      </div>

      <div class="note">All photos stay on this device unless you submit the form.</div>
      <div id="err" class="error" role="alert" style="display:none"></div>
    `;

    this._els = {
      video: this.shadowRoot.getElementById("video"),
      canvas: this.shadowRoot.getElementById("canvas"),
      preview: this.shadowRoot.getElementById("preview"),
      start: this.shadowRoot.getElementById("start"),
      capture: this.shadowRoot.getElementById("capture"),
      retake: this.shadowRoot.getElementById("retake"),
      use: this.shadowRoot.getElementById("use"),
      file: this.shadowRoot.getElementById("file"),
      err: this.shadowRoot.getElementById("err"),
    };

    this._els.start.addEventListener("click", () => this._startCamera());
    this._els.capture.addEventListener("click", () => this._capture());
    this._els.retake.addEventListener("click", () => this._retake());
    this._els.use.addEventListener("click", () => this._emitPhoto());
    this._els.file.addEventListener("change", (e) => this._fromFile(e));
  }

  disconnectedCallback() { this._stopCamera(); }

  _toggleButtons({ start, capture, retake, use }) {
    if (start   != null) this._els.start.disabled   = !start;
    if (capture != null) this._els.capture.disabled = !capture;
    if (retake  != null) this._els.retake.disabled  = !retake;
    if (use     != null) this._els.use.disabled     = !use;
  }

  _showError(msg) { this._els.err.textContent = msg; this._els.err.style.display = "block"; }
  _hideError() { this._els.err.style.display = "none"; }

  async _startCamera() {
    try {
      this._hideError();
      this._stopCamera();

      if (!navigator.mediaDevices?.getUserMedia) {
        this._showError("Camera API not available. Use the Upload button instead.");
        this._toggleButtons({ start: true, capture: false, retake: false, use: false });
        return;
      }

      const constraints = { video: { facingMode: "user", width: 320, height: 240 }, audio: false };
      this._stream = await navigator.mediaDevices.getUserMedia(constraints);
      const v = this._els.video;
      v.srcObject = this._stream;

      await v.play().catch(()=>{});
      if (!v.videoWidth || !v.videoHeight) {
        await new Promise(res => v.addEventListener("loadedmetadata", res, { once: true }));
      }

      // ready to capture
      this._els.preview.style.display = "none";
      v.style.display = "block";
      this._els.canvas.style.display = "none";
      this._toggleButtons({ start: false, capture: true, retake: false, use: false });
    } catch (err) {
      console.error("getUserMedia failed:", err);
      this._showError("Camera blocked or unavailable. You can upload a photo instead.");
      this._toggleButtons({ start: true, capture: false, retake: false, use: false });
    }
  }

  _stopCamera() {
    if (this._stream) {
      this._stream.getTracks().forEach(t => t.stop());
      this._stream = null;
    }
  }

  _capture() {
    const v = this._els.video;
    if (!this._stream || !v || !v.videoWidth) {
      this._showError("Camera not ready yet. Click Start, grant permission, then try again.");
      return;
    }

    // 🔊 play shutter sound
    if (this._audio) { this._audio.currentTime = 0; this._audio.play().catch(()=>{}); }

    const c = this._els.canvas;
    const ctx = c.getContext("2d");
    c.width = v.videoWidth || 320;
    c.height = v.videoHeight || 240;
    try { ctx.drawImage(v, 0, 0, c.width, c.height); }
    catch (e) { console.error("drawImage failed:", e); this._showError("Could not capture the frame."); return; }

    this._els.preview.src = c.toDataURL("image/jpeg", 0.92);
    this._els.preview.style.display = "block";
    v.style.display = "none";
    c.style.display = "none";

    this._toggleButtons({ start: false, capture: false, retake: true, use: true });
  }

  _retake() {
    this._els.preview.style.display = "none";
    if (this._stream) {
      this._els.video.style.display = "block";
      this._toggleButtons({ start: false, capture: true, retake: false, use: false });
    } else {
      this._toggleButtons({ start: true, capture: false, retake: false, use: false });
    }
  }

  _emitPhoto() {
    const dataUrl = this._els.preview.src;
    if (!dataUrl) return;
    // Emit to parent page
    this.dispatchEvent(new CustomEvent("photo-taken", {
      bubbles: true,
      composed: true,
      detail: { dataUrl }
    }));
  }

  _fromFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      this._showError("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this._els.preview.src = reader.result;
      this._els.preview.style.display = "block";
      this._els.video.style.display = "none";
      this._toggleButtons({ start:false, capture:false, retake:true, use:true });
    };
    reader.readAsDataURL(file);
  }
}
customElements.define("zoo-photo-booth", ZooPhotoBooth);