# 🕳️ Trình Mô Phỏng Hố Đen & Giải Phẫu Không-Thời Gian (Gargantua Black Hole Simulator & Anatomy Explorer)

Một ứng dụng tương tác 3D WebGL chân thực lấy cảm hứng từ hố đen **Gargantua** trong tác phẩm điện ảnh *Interstellar*, kết hợp bộ công cụ khám phá giải phẫu vũ trụ và diễn hoạt quá trình hình thành hố đen từ vụ nổ siêu tân tinh (Supernova).

---

## ✨ Điểm Nổi Bật (Key Features)

### 1. 🌌 Dựng hình Chân thực Chuẩn Điện Ảnh (Cinematic Relativistic Raymarching)
* **Thấu kính Hấp dẫn Thời gian thực (Gravitational Lensing):** Sử dụng GLSL Fragment Shader giải phương trình đường trắc địa ánh sáng (Geodesic raymarching) theo Schwarzschild và Kerr metric. Bẻ cong ánh sáng đĩa bồi tụ vắt lên đỉnh và lượn dưới đáy hố đen y hệt trên phim.
* **Bất đối xứng Ánh sáng Tương đối tính (Doppler Beaming):** Vật chất trên đĩa bồi tụ quay với vận tốc cận ánh sáng ($v \approx 0.5c$). Nửa đĩa quay về phía camera sáng rực rỡ và dịch chuyển xanh, nửa đĩa quay ra xa mờ tối và dịch chuyển đỏ.
* **Dịch chuyển Đỏ Hấp dẫn (Gravitational Redshift):** Ánh sáng sát chân trời sự kiện bị mất năng lượng khi leo dốc thế hấp dẫn, chuyển dần sang màu cam/đỏ sẫm.
* **Vòng Hào quang Photon (Photon Ring):** Tái hiện vòng tròn ánh sáng mỏng sắc lẹm bao quanh bóng đen chân trời sự kiện.

### 2. ⚡ Diễn hoạt Quá trình Khởi sinh Hố đen (Genesis Timeline)
Mô phỏng 4 giai đoạn thiên văn học chuẩn xác:
1. **Sao Siêu Khổng Lồ (0% - 25%):** Quả cầu plasma khổng lồ sôi sục đối lưu trong trạng thái cân bằng thủy tĩnh.
2. **Co Rút Lõi Trọng Trường (25% - 45%):** Lõi sắt cạn nhiên liệu nhiệt hạch, sụp đổ với vận tốc 70,000 km/s.
3. **Vụ Nổ Siêu Tân Tinh (45% - 72%):** Sóng phản xung kích (Shockwave) xé toạc các lớp vỏ ngoài với flash trắng chói lòa và hàng nghìn hạt tàn dư phát sáng.
4. **Hố Đen Khởi Sinh (72% - 100%):** Chân trời sự kiện xuất hiện từ tâm vụ nổ, hút bụi sao xung quanh tạo thành Đĩa Bồi Tụ và bắn ra 2 luồng phản lực cực (Polar Jets).

### 3. 🔬 Hệ thống Giải Phẫu Kỹ Thuật Tương Tác (3D Anatomy Explorer)
* **6 Điểm Ghim 3D Radar (Interactive Hotspots):**
  * **Điểm Kỳ Dị (Singularity):** $r=0$, mật độ vô hạn.
  * **Chân Trời Sự Kiện (Event Horizon):** Bán kính $R_s = \frac{2GM}{c^2}$, ranh giới một chiều không lối thoát.
  * **Quả Cầu Photon (Photon Sphere):** $R = 1.5 R_s$, nơi ánh sáng bay theo quỹ đạo tròn hoàn hảo.
  * **Vùng Cận Biên Ergosphere:** Vùng không-thời gian bị kéo xoay theo hố đen quay Kerr.
  * **Quỹ Đạo Tròn Ổn Định Trong Cùng (ISCO):** $R = 3 R_s$, mép trong cùng của đĩa bồi tụ.
  * **Đĩa Bồi Tụ & Doppler Beaming:** Lò luyện plasma ma sát hàng triệu độ K.
* **Chế độ Lát Cắt 90° (Cutaway Mode):** Mở góc tư của chân trời sự kiện để camera nhìn thấu không gian bên trong dẫn đến Điểm Kỳ Dị.
* **Camera Cinematic Glide:** Bấm vào điểm giải phẫu để camera tự động lướt mượt mà tới góc nhìn cận cảnh.

### 4. 🎛️ Bảng Điều Khiển HUD Sci-Fi & Âm Thanh Không Gian
* Điều chỉnh Khối lượng ($M$), Vận tốc tự quay Spin ($a$), Mật độ đĩa bồi tụ, công tắc Doppler beaming và Cutaway.
* **Web Audio API Synthesizer:** Tự động tạo âm thanh trầm nền không gian (Cosmic Sub-bass Drone 42Hz) và tiếng rền nổ siêu tân tinh mà không cần file MP3 ngoài.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Quick Start)

### Yêu cầu:
* Node.js phiên bản 18 trở lên.
* Trình duyệt hỗ trợ WebGL2 (Chrome, Firefox, Edge, Safari).

### Các bước thực hiện:
```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi động môi trường phát triển (Dev server)
npm run dev

# 3. Chạy toàn bộ bài kiểm thử tự động (Unit tests)
npm test

# 4. Đóng gói sản phẩm (Production build)
npm run build
```

---

## 🎮 Hướng Dẫn Tương Tác

| Thao tác | Tác dụng |
|---|---|
| **Chuột trái / Chạm 1 ngón & Kéo** | Xoay tự do góc nhìn 360° quanh hố đen |
| **Cuộn chuột / Véo 2 ngón (Pinch)** | Phóng to / thu nhỏ (Zoom) |
| **Chuột phải & Kéo** | Di chuyển tâm góc nhìn (Pan) |
| **Click vào Hotspot tròn xanh** | Lướt camera tới bộ phận đó và mở thẻ thông tin giải phẫu |
| **Bật/Tắt Lát cắt 90° trên HUD** | Cắt lớp vỏ chân trời sự kiện để nhìn vào điểm kỳ dị |
| **Nút "Khởi Sinh (Genesis)"** | Chuyển sang xem kịch bản ngôi sao nổ thành hố đen |

---

## 📁 Cấu Trúc Mã Nguồn

```text
src/
├── main.js                  # Entrypoint chính của ứng dụng
├── style.css                # Tailwind & hiệu ứng Glassmorphism
├── core/
│   ├── SceneManager.js      # Quản lý Three.js Scene, Camera, OrbitControls, Resize
│   └── StateManager.js      # Quản lý State toàn cục & cơ chế Pub/Sub
├── shaders/
│   ├── blackHole.vert.glsl  # Vertex shader cho Bounding volume
│   ├── blackHole.frag.glsl  # Fragment shader raymarching Schwarzschild/Kerr & Doppler
│   ├── starPlasma.frag.glsl # Shader bề mặt sao siêu khổng lồ
│   └── shockwave.frag.glsl  # Shader sóng xung kích Supernova
├── objects/
│   ├── BlackHole.js         # Thực thể Hố đen 3D bọc ShaderMaterial
│   ├── StarCollapse.js      # Hệ thống 4 giai đoạn sụp đổ sao & hạt tàn dư
│   ├── PolarJets.js         # Luồng tia phản lực plasma cực
│   └── Starfield.js         # Bầu trời sao nền vũ trụ 3D
├── anatomy/
│   ├── anatomyData.js       # Cơ sở dữ liệu khoa học về 6 bộ phận hố đen
│   └── HotspotManager.js    # Chiếu tọa độ 3D sang 2D overlay và điều khiển camera
├── ui/
│   ├── HUD.js               # Bảng điều khiển tham số vật lý
│   ├── TimelineBar.js       # Thanh tua thời gian các giai đoạn khởi sinh
│   └── InfoCard.js          # Thẻ giải thích khoa học chuyên sâu
└── utils/
    ├── physics.js           # Công thức Schwarzschild, ISCO, Doppler, Redshift
    └── cosmicAudio.js       # Bộ tổng hợp âm thanh không gian Web Audio API
```

---

## 📜 Giấy Phép & Bản Quyền
Dự án được xây dựng phục vụ mục đích nghiên cứu, giáo dục khoa học và đồ họa máy tính 3D tương tác.
MIT License.
