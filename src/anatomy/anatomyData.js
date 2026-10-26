/**
 * Scientific Metadata for Black Hole Anatomy Breakdown
 */
export const ANATOMY_DATA = [
  {
    id: 'singularity',
    name: 'Điểm Kỳ Dị (Gravitational Singularity)',
    formula: 'r = 0, \\rho \\to \\infty',
    badge: 'Lõi Trung Tâm',
    relativeRadius: 0.0,
    cameraOffset: { x: 0.0, y: 1.0, z: 4.0 },
    description: 'Tâm điểm nơi toàn bộ khối lượng của hố đen bị nén về thể tích bằng 0. Mật độ vật chất và độ cong không-thời gian tiến tới vô cực. Tại đây, thuyết tương đối rộng của Einstein bị phá vỡ và cần đến thuyết hấp dẫn lượng tử.',
    funFact: 'Hiện tượng "Mì Ý hóa" (Spaghettification): Lực thủy triều hấp dẫn ở chân bạn mạnh hơn đầu hàng triệu lần, kéo dãn cơ thể thành một chuỗi nguyên tử dài trước khi chạm điểm kỳ dị.'
  },
  {
    id: 'eventHorizon',
    name: 'Chân Trời Sự Kiện (Event Horizon)',
    formula: 'R_s = \\frac{2GM}{c^2}',
    badge: 'Ranh Giới Một Chiều',
    relativeRadius: 1.0,
    cameraOffset: { x: 2.2, y: 1.2, z: 3.2 },
    description: 'Ranh giới phân cách vũ trụ bên ngoài và vực thẳm bên trong. Tại đây, vận tốc đào thoát vượt quá vận tốc ánh sáng (v_e >= c). Bất cứ thứ gì vượt qua ranh giới này, kể cả ánh sáng, vĩnh viễn không thể quay trở lại.',
    funFact: 'Với người quan sát ở xa, hình ảnh người rơi vào chân trời sự kiện sẽ mờ dần, đỏ dần do dịch chuyển đỏ hấp dẫn và như bị "đóng băng" vĩnh viễn tại ranh giới này mà không bao giờ thấy họ thực sự vượt qua.'
  },
  {
    id: 'photonSphere',
    name: 'Quả Cầu Photon (Photon Sphere)',
    formula: 'R_{ph} = 1.5 R_s = \\frac{3GM}{c^2}',
    badge: 'Quỹ Đạo Ánh Sáng',
    relativeRadius: 1.5,
    cameraOffset: { x: 3.0, y: 1.6, z: 4.2 },
    description: 'Vùng không gian nơi trọng lực cực mạnh bẻ cong photon thành quỹ đạo tròn khép kín quanh hố đen. Đây là quỹ đạo không bền vững: chỉ cần một nhiễu loạn nhỏ, photon sẽ hoặc rơi vào hố đen hoặc văng ra ngoài không gian.',
    funFact: 'Nếu bạn có thể đứng lơ lửng tại quả cầu photon và bật đèn pin chiếu thẳng về phía trước, bạn sẽ nhìn thấy chính gáy của mình do photon đi một vòng tròn hoàn hảo quanh hố đen rồi đập vào mắt bạn!'
  },
  {
    id: 'ergosphere',
    name: 'Vùng Cận Biên Ergosphere',
    formula: 'R_{ergo}(\\theta) = M + \\sqrt{M^2 - a^2\\cos^2\\theta}',
    badge: 'Kéo Lê Hệ Quy Chiếu',
    relativeRadius: 1.9,
    cameraOffset: { x: 3.8, y: 2.0, z: 5.2 },
    description: 'Vùng không gian hình phỏng cầu nằm ngoài chân trời sự kiện của hố đen quay (Kerr Black Hole). Lực hấp dẫn kéo lê cấu trúc không-thời gian theo chiều quay của nó (hiệu ứng Lense-Thirring). Không vật thể nào có thể đứng yên tại đây.',
    funFact: 'Quá trình Penrose: Có thể trích xuất động năng tự quay khổng lồ từ Ergosphere bằng cách bắn vật chất vào và thu lại phần phản xạ với năng lượng lớn hơn cả năng lượng nghỉ ban đầu!'
  },
  {
    id: 'isco',
    name: 'Quỹ Đạo Ổn Định Trong Cùng (ISCO)',
    formula: 'R_{isco} = 3 R_s \\text{ (Schwarzschild)}',
    badge: 'Mép Trong Đĩa Bồi Tụ',
    relativeRadius: 3.0,
    cameraOffset: { x: 5.0, y: 2.5, z: 6.8 },
    description: 'Quỹ đạo tròn ổn định cuối cùng trước khi vật chất mất thăng bằng và rơi tự do vào miệng hố đen. Đây chính là lý do vì sao đĩa bồi tụ có một khoảng trống tròn rỗng ngăn cách giữa mép trong và chân trời sự kiện.',
    funFact: 'Đối với hố đen quay cực đại (a -> 1.0), ISCO thu hẹp sát sạt chân trời sự kiện (xuống tới 0.5 Rs), cho phép vật chất giải phóng năng lượng ma sát cực độ trước khi biến mất.'
  },
  {
    id: 'accretionDisk',
    name: 'Đĩa Bồi Tụ & Doppler Beaming',
    formula: 'I_{obs} \\approx I_{emit} \\cdot \\delta^4',
    badge: 'Lò Luyện Plasma',
    relativeRadius: 5.5,
    cameraOffset: { x: 0.0, y: 4.5, z: 12.0 },
    description: 'Vòng xoáy plasma và bụi khí quay với vận tốc tương đối tính tiệm cận vận tốc ánh sáng. Ma sát nội tại khổng lồ nung nóng đĩa lên hàng chục triệu độ K. Hiệu ứng Doppler beaming khiến nửa đĩa quay về phía ta sáng rực rỡ và lệch xanh.',
    funFact: 'Hiệu suất chuyển hóa khối lượng thành năng lượng bức xạ của đĩa bồi tụ hố đen lên tới 42% – vượt trội gấp 50 lần so với phản ứng nhiệt hạch tổng hợp hạt nhân trong lõi Mặt Trời (~0.7%)!'
  }
];
