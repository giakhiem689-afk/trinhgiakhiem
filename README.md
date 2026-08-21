# trinhgiakhiem.info.vn

Website cá nhân của **Trịnh Gia Khiêm** — hồ sơ nghề nghiệp, nghiên cứu và blog về tâm lý giáo dục, hỗ trợ người học, giảng dạy tiếng Anh và AI trong giáo dục.

Xây dựng bằng [Astro](https://astro.build) (static site, không cần server).

## Chạy dự án

Yêu cầu Node.js >= 22.12.0

```sh
npm install      # cài đặt thư viện
npm run dev      # chạy thử tại http://localhost:4321
npm run build    # build ra thư mục ./dist
npm run preview  # xem thử bản build trước khi deploy
```

## Cấu trúc thư mục

```
public/           Tài nguyên tĩnh (ảnh, favicon, robots.txt, CV, game)
  admin/          Giao diện Decap CMS để soạn nội dung trực tiếp trên web
  images/         Ảnh dùng trong site (avatar, og-image, minh hoạ)
src/
  components/     Thành phần giao diện tái sử dụng (Header, Hero, Footer...)
  content/        Nội dung dạng Markdown
    blog/         Bài viết
    projects/     Dự án
    research/     Nghiên cứu
  data/           Dữ liệu cấu hình (profile, navigation, timeline)
  layouts/        Bố cục trang
  pages/          Các trang của website (mỗi file = một đường dẫn)
  styles/         CSS toàn cục và design tokens
astro.config.mjs  Cấu hình Astro (domain, sitemap)
```

## Soạn nội dung

Hai cách:

1. **Qua CMS** — truy cập `/admin` trên website đã deploy, đăng nhập bằng GitHub, soạn và xuất bản trực tiếp.
2. **Qua file Markdown** — thêm file mới vào `src/content/blog/`, `src/content/projects/` hoặc `src/content/research/`, khai báo đầy đủ frontmatter theo mẫu các bài đang có.

Đặt `draft: true` trong frontmatter để giữ bài ở chế độ nháp (không hiển thị ra ngoài).

## Lưu ý khi thêm ảnh

Nén ảnh trước khi đưa vào `public/images/` — nên giữ dưới ~300KB. Ảnh chân dung/ảnh chụp dùng `.jpg`, ảnh đồ hoạ nhiều mảng màu phẳng dùng `.png`. Đặt tên file không dấu, không khoảng trắng.

## Deploy

Site được cấu hình cho domain `https://trinhgiakhiem.info.vn` (khai báo tại `astro.config.mjs` và `public/robots.txt`). Nếu đổi domain, cần sửa ở cả hai nơi.
