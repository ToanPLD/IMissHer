# Tài liệu Thiết kế Kỹ thuật (Design Spec): Trình Mô phỏng 3D Hố đen & Khám phá Giải phẫu (Black Hole Simulation & Anatomy Explorer)

**Ngày lập:** 2026-10-26  
**Trạng thái:** Bản thảo đã duyệt qua Brainstorming  
**Công nghệ chính:** Three.js, GLSL Raymarching Shaders, Vite, Tailwind CSS, Web Audio API  

---

## 1. Tổng quan & Mục tiêu Dự án (Overview & Goals)

Xây dựng ứng dụng web tương tác 3D mô phỏng chân thực và sống động hố đen vũ trụ với độ hoàn thiện cao (lấy cảm hứng từ hình ảnh hố đen Gargantua trong tác phẩm điện ảnh *Interstellar*), đồng thời tích hợp hệ thống diễn hoạt giải thích nguồn gốc hình thành hố đen (sự sụp đổ của sao siêu khổng lồ) và mô hình giải phẫu chi tiết từng thành phần vật lý của hố đen theo phong cách "kỹ thuật giải phẫu tương tác" (Interactive Anatomy).

### Mục tiêu cốt lõi:
1. **Mô phỏng Quang học & Không-Thời gian Chân thực:** Sử dụng kỹ thuật GLSL Raymarching thời gian thực để tính toán độ cong tia sáng quanh chân trời sự kiện, tạo nên hiệu ứng đĩa bồi tụ uốn cong lên trên và dưới đỉnh hố đen, vòng photon và bất đối xứng ánh sáng do hiệu ứng Doppler tương đối tính.
2. **Kể chuyện Khoa học về Khởi sinh Hố đen:** Diễn hoạt 4 giai đoạn từ ngôi sao siêu khổng lồ $\rightarrow$ sụp đổ trọng trường $\rightarrow$ vụ nổ siêu tân tinh $\rightarrow$ chân trời sự kiện xuất hiện và đĩa bồi tụ hình thành.
3. **Mô hình Giải phẫu 3D Tương tác:** Cung cấp 6 điểm ghim 3D (hotspots) gắn với các bộ phận cấu tạo của hố đen, hỗ trợ chế độ lát cắt (cutaway view) để quan sát tận điểm kỳ dị bên trong.
4. **Hiệu năng & Khả năng Tương thích:** Hoạt động mượt mà ở 60 FPS trên trình duyệt hiện đại thông qua thuật toán raymarching thích ứng (adaptive step-size) và dynamic resolution scaling.

---

## 2. Kiến trúc Hệ thống & Cấu trúc Thư mục (Architecture & Folder Structure)

Ứng dụng được xây dựng theo mô hình Module hóa hướng đối tượng (Modular OOP & Component-based Architecture):

```text
IMissHer/
├── index.html                     # Entrypoint HTML: Canvas container, UI HUD & Hotspot overlays
├── package.json                   # Dependencies: three, vite, tailwindcss, lucide-icons
├── vite.config.js                 # Cấu hình Vite với hỗ trợ GLSL raw string import
├── tailwind.config.js             # Theme Sci-Fi, bảng màu Cyan/Amber/Obsidian
├── src/
│   ├── main.js                    # Bootstrap ứng dụng, khởi tạo vòng lặp render
│   ├── core/
│   │   ├── SceneManager.js        # Three.js WebGLRenderer, PerspectiveCamera, OrbitControls
│   │   └── StateManager.js        # Trạng thái toàn cục (Chế độ, Tham số vật lý, Tiến trình timeline)
│   ├── shaders/
│   │   ├── blackHole.vert.glsl    # Vertex shader cho Bounding Cube/Sphere Raymarching
│   │   ├── blackHole.frag.glsl    # Fragment shader: Geodesic ray bending, Accretion disk, Doppler, Redshift
│   │   ├── starPlasma.frag.glsl   # Shader bề mặt sao siêu khổng lồ (plasma & convection cells)
│   │   └── supernova.frag.glsl    # Shader vụ nổ siêu tân tinh & sóng xung kích shockwave
│   ├── objects/
│   │   ├── BlackHole.js           # Quản lý Mesh, Material và Uniforms của hố đen
│   │   ├── StarCollapse.js        # Quản lý thực thể ngôi sao, diễn biến co rút lõi và hệ hạt tàn dư
│   │   ├── PolarJets.js           # Luồng phản lực plasma phát ra từ hai cực
│   │   └── Starfield.js           # Bầu trời sao nền 3D với hiệu ứng thấu kính hấp dẫn (Einstein ring)
│   ├── anatomy/
│   │   ├── anatomyData.js         # Dữ liệu khoa học: Tên, công thức, bán kính, mô tả chi tiết
│   │   └── HotspotManager.js      # Chiếu tọa độ Vector3 sang màn hình 2D, hiệu ứng radar pulse
│   ├── ui/
│   │   ├── HUD.js                 # Control deck: Sliders (Mass, Spin, Accretion), Toggles
│   │   ├── TimelineBar.js         # Scrubber thanh tua 4 giai đoạn khởi sinh hố đen
│   │   └── InfoCard.js            # Thẻ thông tin giải phẫu khoa học mở ra khi chọn hotspot
│   └── utils/
│       ├── physics.js             # Công thức Schwarzschild ($R_s = 2GM/c^2$), ISCO ($3R_s$), Photon Sphere ($1.5R_s$)
│       └── cosmicAudio.js         # Web Audio API Synthesizer: Drone vũ trụ sâu & Shockwave âm trầm
```

---

## 3. Chi tiết Dựng hình & Thuật toán Vật lý (Physics & Raymarching Engine)

### 3.1. Thuật toán Raymarching Uốn cong Ánh sáng (Gravitational Geodesics)
Tia sáng xuất phát từ vị trí camera $\mathbf{p}_0$ với hướng $\mathbf{v}_0$. Trong không-thời gian bị cong gần hố đen không quay (Schwarzschild metric) hoặc hố đen quay (Kerr metric):
- Gia tốc uốn cong tia sáng:
  $$\frac{d^2\mathbf{x}}{d\lambda^2} = -\frac{3}{2} R_s \frac{\mathbf{x} \times (\mathbf{v} \times \mathbf{x})}{|\mathbf{x}|^5}$$
  với $R_s = \frac{2GM}{c^2}$ là bán kính Schwarzschild.
- **Tiêu chí kết thúc tia sáng:**
  1. Nếu $|\mathbf{x}| \le R_s$: Tia bị hấp thụ hoàn toàn vào chân trời sự kiện $\rightarrow$ màu đen tuyệt đối (`vec3(0.0)`).
  2. Nếu tia cắt qua mặt phẳng đĩa bồi tụ ($z \approx 0$ và $R_{in} \le r \le R_{out}$): Lấy mẫu thể tích đĩa bồi tụ dựa trên noise 3D và hàm truyền màu nhiệt độ plasma.
  3. Nếu $|\mathbf{x}| > R_{escape}$: Tia thoát ra vô cực $\rightarrow$ lấy mẫu bản đồ sao nền với góc bị uốn cong, tạo vòng Einstein tự nhiên.

### 3.2. Hiệu ứng Tương đối tính (Relativistic Effects)
1. **Doppler Beaming (Lorentz Boosting):**
   Vật chất trên đĩa bồi tụ quay với vận tốc tương đối tính $\vec{\beta} = \vec{v}/c$. Thừa số Doppler dịch chuyển năng lượng và cường độ:
   $$\delta = \frac{1}{\gamma (1 - \vec{\beta} \cdot \vec{n})}$$
   Cường độ bức xạ quan sát được tỷ lệ với $\delta^4$. Điều này khiến nửa đĩa quay về phía camera sáng gấp hàng chục lần nửa đĩa quay ra xa, tạo ra hình ảnh chuẩn Gargantua.
2. **Dịch chuyển Đỏ Hấp dẫn (Gravitational Redshift):**
   Photon phát ra từ bán kính $r$ chịu độ dịch chuyển:
   $$1 + z = \left(1 - \frac{R_s}{r}\right)^{-1/2}$$
   Mép trong của đĩa bồi tụ sát chân trời sự kiện bị lệch đỏ sẫm sang gam màu cam đậm/hồng ngoại.

---

## 4. Kịch bản Diễn hoạt Khởi sinh Hố đen (Genesis & Supernova Timeline)

Hệ thống cung cấp một thanh Timeline tương tác từ $0\%$ đến $100\%$, tương ứng với 4 giai đoạn thiên văn:

| Giai đoạn | Tiến trình | Hiện tượng Thiên văn | Hiệu ứng Hình ảnh (Visual Effects) |
|---|---|---|---|
| **1. Sao Siêu Khổng Lồ** | 0% - 25% | Cân bằng thủy tĩnh, nhiệt hạch hydro/heli/cacbon/sắt | Quả cầu plasma khổng lồ rực sáng, bề mặt sôi sục đối lưu, quầng hào quang corona rực rỡ |
| **2. Sụp Đổ Lõi Trọng Trường** | 25% - 45% | Lõi sắt ngừng sinh nhiệt, áp suất bức xạ tụt về 0, lõi sụp đổ vận tốc 70,000 km/s | Sao co rút đột ngột với gia tốc cao, bề mặt chuyển sang tím đậm/tia X, không gian bắt đầu méo |
| **3. Vụ nổ Siêu Tân Tinh** | 45% - 75% | Sóng phản xung kích nổ tung các lớp vỏ ngoài của sao vào không gian | Flash trắng chói lòa toàn màn hình, sóng xung kích shockwave hình cầu dãn nở cùng hàng chục nghìn hạt plasma |
| **4. Hố Đen Khởi Sinh** | 75% - 100% | Lõi vượt quá giới hạn TOV, nén thành Singularity; Event Horizon & Accretion Disk xuất hiện | Chân trời sự kiện đen bóng mở rộng, thấu kính hấp dẫn uốn cong ánh sáng tàn dư sao thành đĩa bồi tụ xoáy |

- **Tính năng điều khiển:** Nút Play/Pause tự động chạy timeline; thanh kéo tua (scrubber) cho phép dừng ở bất kỳ thời điểm nào; hỗ trợ đổi tốc độ (1x, 2x, 0.5x).

---

## 5. Hệ thống Giải phẫu & Điểm ghim 3D (Anatomy Breakdown & Hotspots)

### 5.1. Sáu Bộ phận Giải phẫu Cốt lõi:
1. **Điểm Kỳ Dị (Singularity):** Tâm điểm với độ cong không-thời gian vô hạn, bán kính $r=0$.
2. **Chân Trời Sự Kiện (Event Horizon):** Ranh giới một chiều, bán kính $R_s = \frac{2GM}{c^2}$. Vận tốc thoát $v_e = c$.
3. **Quả Cầu Photon (Photon Sphere):** Bán kính $r = 1.5 R_s$, nơi ánh sáng bị bẻ cong thành quỹ đạo tròn khép kín.
4. **Vùng Cận Biên Ergosphere:** Vùng không gian bị kéo xoáy bởi chuyển động tự quay của hố đen Kerr.
5. **Quỹ Đạo Ổn Định Trong Cùng (ISCO):** Bán kính $r = 3 R_s$, mép trong cùng nơi vật chất duy trì được quỹ đạo tròn trước khi lao thẳng vào hố đen.
6. **Đĩa Bồi Tụ & Luồng Phản Lực Cực (Accretion Disk & Relativistic Jets):** Vòng plasma nung nóng hàng triệu độ và 2 cột hạt năng lượng cao bắn ra từ hai cực.

### 5.2. Chế độ Lát Cắt (Cutaway Mode)
Bật công tắc Cutaway sẽ loại bỏ 1 góc 90° của mặt phẳng chân trời sự kiện, cho phép camera nhìn thấu không gian bên trong dẫn đến Điểm Kỳ Dị (Singularity) với lưới tọa độ không-thời gian bị co kéo vào tâm điểm.

---

## 6. Giao diện Người dùng (HUD Controls) & Âm thanh Vũ trụ

### 6.1. Sci-Fi HUD Control Deck (Tailwind CSS)
- **Sliders:**
  - Khối lượng $M$ ($3 M_\odot \rightarrow 10^9 M_\odot$).
  - Spin tham số $a$ ($0.0 \rightarrow 0.998$).
  - Mật độ đĩa bồi tụ Accretion Density ($0.1 \rightarrow 3.0$).
- **Toggles:**
  - Bật/tắt Doppler Beaming.
  - Bật/tắt Lưới tọa độ không-thời gian (Spacetime Grid).
  - Bật/tắt Chế độ Lát cắt (Cutaway).
  - Bật/tắt Âm thanh vũ trụ.
- **Mode Switcher:** Chuyển đổi giữa Chế độ "Khởi sinh (Genesis)" và "Giải phẫu (Anatomy)".

### 6.2. Bộ Tổng hợp Âm thanh (Cosmic Audio Synthesizer)
Tạo âm thanh thông qua Web Audio API không phụ thuộc file âm thanh ngoài:
- **Cosmic Drone:** 2 bộ dao động sóng sin (Sine Oscillators) ở tần số cực thấp (40 Hz - 55 Hz) với LFO điều biến nhẹ tạo cảm giác giếng hấp dẫn vô tận.
- **Supernova Rumble:** Tiếng ồn trắng (White noise) lọc qua Low-pass Filter với envelope bùng nổ khi vụ nổ siêu tân tinh diễn ra.

---

## 7. Kế hoạch Kiểm thử & Đảm bảo Hiệu năng (Verification & Quality Assurance)

1. **Kiểm tra Độ chính xác Thị giác:** So sánh hình ảnh render với bức ảnh chụp mô phỏng Gargantua (vòng hào quang uốn phía trên, phía dưới, bất đối xứng sáng Doppler).
2. **Kiểm tra Tốc độ Khung hình (FPS Benchmark):** Đảm bảo duy trì $\ge 60$ FPS ở độ phân giải 1080p trên GPU phổ thông.
3. **Kiểm tra Tương thích Di động:** Giao diện co giãn responsive, hỗ trợ thao tác chạm cảm ứng (touch gestures) để xoay/zoom.
4. **Kiểm tra Tính toàn vẹn của Timeline & Hotspots:** Tua đi tua lại timeline không gây memory leak hoặc lỗi shader uniform.
