# Hướng dẫn cập nhật vào `D:\CÁC DỰ ÁN\WEBSITE TrinhGiaKhiem`

## Bước 1 — Giải nén đè lên thư mục gốc

Giải nén toàn bộ nội dung file zip vào `D:\CÁC DỰ ÁN\WEBSITE TrinhGiaKhiem`, chọn **Replace / Ghi đè** khi Windows hỏi.

## Bước 2 — XOÁ THỦ CÔNG các file cũ

Việc giải nén chỉ **thêm và ghi đè**, không tự xoá file cũ. Hãy xoá thủ công những mục sau trong thư mục gốc:

| Xoá | Lý do |
|---|---|
| Thư mục `Game\` (ở thư mục gốc) | Trùng lặp hoàn toàn với `public\game\` — đây mới là bản website dùng. Riêng `Game\build_package.py` còn lộ đường dẫn máy cá nhân `c:/Users/KHIEMTG/...` |
| `Promt.txt` | Ghi chú nháp, không nên public trên GitHub |
| `Trịnh Gia Khiêm - Hồ sơ nghề nghiệp.docx` | File cá nhân, không thuộc mã nguồn website |
| `public\images\avatar.png` | Đã thay bằng `avatar.jpg` nhẹ hơn 23 lần |
| `public\images\Demo_PP_Bangthongtin_07.07.2026 copy.png` | Đã thay bằng `phuong-phap-hoc-tap.png` |

> Nếu bạn vẫn muốn giữ bản game đóng gói cho máy tính (Electron), hãy sao chép thư mục `Game\` sang chỗ khác **ngoài** thư mục website trước khi xoá.

## Bước 3 — Chạy thử

```sh
npm install
npm run dev
```

Mở `http://localhost:4321`, thu nhỏ cửa sổ trình duyệt xuống cỡ điện thoại để kiểm tra nút menu ☰ đã hoạt động.

## Bước 4 — Đẩy lên GitHub

```sh
git add -A
git commit -m "Sửa menu di động, OG image, robots.txt, tối ưu ảnh và dọn repo"
git push
```

Lệnh `git add -A` sẽ tự ghi nhận cả các file bạn đã xoá ở Bước 2.
