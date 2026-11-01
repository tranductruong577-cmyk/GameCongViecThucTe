# Bảng nhiệm vụ (Game Thực Tế)

Web app một trang, chạy hoàn toàn trên trình duyệt (HTML + CSS + JavaScript thuần, không cần cài đặt hay build).
Nhân vật: **TruongTD**. Giao diện tiếng Việt, tối ưu cho điện thoại (iPhone).

## Cấu trúc thư mục
| Tệp | Nội dung |
|---|---|
| `index.html` | Khung trang, thẻ meta iPhone, nạp `style.css` và các tệp trong `js/` theo thứ tự |
| `style.css` | Toàn bộ giao diện, màu sáng/tối (biến màu ở đầu tệp), viền avatar theo danh hiệu |
| `js/core.js` | Dữ liệu mặc định `defaults()`, chuẩn hóa `norm()`, `save()`, thời gian `NOW/fd/key` |
| `js/account.js` | Đăng ký, đăng nhập, đăng xuất, sửa hồ sơ, đổi mật khẩu, xóa tài khoản (`ACC`, `hashPw`, `authView`) |
| `js/audio.js` | Âm thanh Web Audio: `tone`, `boom`, `sfx`, `music` |
| `js/fx.js` | Hiệu ứng canvas (`fireworks`, `snackShow`, `clothShow`, `storeShow`), phân loại quà `kindOf` |
| `js/health.js` | Mục Sức khỏe: `healthView`, `hcheck`, `openHset` |
| `js/views.js` | Giao diện các tab, `hero`, `nav`, `gain`, `lvl`, `toast`, danh hiệu `RANKS` |
| `js/app.js` | `render()`, hộp thoại, bộ lắng nghe sự kiện, nút nổi 💪 |
| `js/pwa.js`, `sw.js`, `manifest.json` | Chạy ngoại tuyến và cài như app (PWA) |
| `assets/` | `avatar.jpg`, `icon.png` (180), `icon-192.png`, `icon-512.png` |

Các tệp `js/` là script thường (không phải module) dùng chung biến toàn cục, nên thứ tự nạp trong `index.html` quan trọng.

Chạy thử: mở `index.html` bằng trình duyệt, hoặc chạy `python3 -m http.server` trong thư mục này rồi vào `http://localhost:8000`.

## Tính năng
- Nhiệm vụ hằng ngày, tuần, tháng: nút **Tiến hành** (nhân vật ngồi làm việc trước máy tính) rồi **Hoàn thành** (pháo hoa, âm thanh), có **Hoàn tác**.
- Xong hết nhiệm vụ của một loại thì thưởng thêm 15 xu.
- Điểm danh mỗi ngày, chuỗi ngày liên tiếp, thưởng thêm mỗi 7 ngày, lịch tháng.
- Cửa hàng phần thưởng đổi bằng xu, có 3 hiệu ứng riêng theo loại: đồ ăn vặt (thùng đồ bay tới), quần áo (vòng xoay chọn áo), thiết bị gia dụng (đi mua ở siêu thị).
- Mục Sức khỏe (nút tròn 💪 kéo thả được): thể thao, uống nước, ăn uống, giấc ngủ, biểu đồ 7 ngày, mục tiêu chỉnh được.
- Xu, XP, cấp độ, nhạc nền, hiệu ứng âm thanh (tạo bằng Web Audio, không dùng tệp âm thanh), giao diện sáng/tối, sao lưu bằng mã.

## Quy tắc thời gian (quan trọng)
- Mọi mốc tính theo **giờ Việt Nam (UTC+7)** bất kể múi giờ của máy: hàm `NOW()` cộng 7 tiếng rồi chỉ dùng các hàm `getUTC...`.
- Nhiệm vụ ngày làm mới 00:00 mỗi ngày, tuần làm mới 00:00 Thứ Hai, tháng làm mới 00:00 ngày 1 (hàm `key(loại)`).
- Game chỉ hoạt động từ ngày `S.start` (mặc định `2026-11-02`, một ngày Thứ Hai). Trước ngày đó các nút Hoàn thành, Điểm danh, Đổi quà, Sức khỏe bị khóa. Đổi ngày ở tab Khác, mục Ngày bắt đầu game.

## Tài khoản
- Mở game lần đầu sẽ thấy màn hình **Đăng ký** (tên đăng nhập, tên nhân vật, ảnh, mật khẩu). Có tài khoản rồi thì hiện màn hình **Đăng nhập**; phiên đăng nhập được giữ cho đến khi bấm Đăng xuất (tab Khác).
- Danh sách tài khoản lưu ở `localStorage` khóa `questboard.accounts`. Mật khẩu **không lưu thẳng**: chỉ lưu bản băm PBKDF2-SHA256 (150.000 vòng, muối ngẫu nhiên riêng). Sai 5 lần thì khóa 30 giây.
- Dữ liệu game của mỗi tài khoản nằm riêng ở khóa `questboard.v1.u.<tên đăng nhập>`. Dữ liệu cũ (khóa `questboard.v1`) được đề nghị gắn vào tài khoản đầu tiên khi đăng ký.
- Giới hạn: tài khoản chỉ nằm trên thiết bị và trình duyệt này, không đồng bộ và không khôi phục được mật khẩu (dùng mã sao lưu ở tab Khác). Đây là cách tách người chơi và che dữ liệu, không phải bảo mật chống người có quyền truy cập máy. Muốn đăng nhập được trên nhiều thiết bị cần máy chủ riêng.
- Tab Khác có nút **Làm lại từ đầu**: xu về 0, ngày bắt đầu = Thứ Hai của tuần hiện tại, tiến độ nhiệm vụ làm lại, giữ danh sách nhiệm vụ và quà. Có tùy chọn đặt lại cả XP, điểm danh, sức khỏe, số lần đổi quà và lịch sử.
- Ảnh nhân vật được cắt vuông 160x160 và lưu trong tài khoản.
- Mã băm cần `crypto.subtle`, nên mở qua https hoặc `localhost` (mở thẳng tệp `file://` thường vẫn chạy trên Chrome).

## Dữ liệu lưu trữ
- Toàn bộ trạng thái là một đối tượng `S`, lưu vào `localStorage` (khóa riêng của tài khoản đang đăng nhập) mỗi lần `render()` (hàm `save()`).
- Trường chính: `coins`, `xp`, `quests[]` (`id,name,type,coin,xp,done,doing`), `rewards[]` (`id,name,cost,got,kind`), `checkins[]`, `bonus{}`, `log[]`, `health{goals,hist,day,d}`, `start`, `theme`, `sfx`, `music`, `fab`, `v`.
- `norm()` chạy khi đọc `localStorage` và khi nhập mã sao lưu: bổ sung trường thiếu, bỏ mục hỏng. Mã sai cấu trúc bị từ chối, dữ liệu hiện tại được giữ nguyên.
- Đã bỏ khối "tặng 10.000 xu / quà thử" và mã đồng bộ khung xem Claude. Người dùng mới bắt đầu từ 0 xu với vài nhiệm vụ và quà mẫu trong `defaults()`; sửa hoặc xóa mẫu ở đó khi bàn giao.
- Quy tắc xu: Hoàn tác nhiệm vụ thu hồi cả thưởng "xong hết" (+15) và bị chặn nếu xu đã tiêu. Bỏ tick mục sức khỏe thu hồi xu của mục đó (chỉ khi còn đủ xu).
- Biểu đồ 7 ngày: ngày không mở app hiện "–" và không tính vào trung bình.

## Các hàm chính trong app.js
- Thời gian: `NOW`, `fd` (định dạng ngày), `key`, `started`, `banner`.
- Giao diện từng tab: `questsView`, `streakView`, `shopView`, `healthView`, `moreView`, `hero`, `nav`, `render` (vẽ lại toàn bộ).
- Thao tác: bộ lắng nghe `click` và `change` ở cuối tệp (dùng thuộc tính `data-...` trên nút), `openDlg`, `askDel`, `openHset`, `gain` (cộng xu/XP), `hcheck` (tính thưởng sức khỏe).
- Hiệu ứng: `fireworks`, `snackShow`, `clothShow`, `storeShow` (vẽ bằng canvas `#fx`), `scene` (nhân vật làm việc), `drawChar`, `shirt`, `drawBox`.
- Âm thanh: `tone`, `boom`, `sfx`, `music`.
- Phân loại quà: `kindOf` (tự nhận biết loại quà theo tên bằng các biểu thức `SNK`, `CLT`, `APL`).

## Đưa lên web (dùng như app trên điện thoại)
1. Tải cả thư mục lên Netlify Drop, GitHub Pages hoặc Cloudflare Pages (tệp vào thư mục gốc, giữ nguyên tên `index.html`). Phải chạy qua https thì ngoại tuyến mới hoạt động.
2. Mở link bằng Safari trên iPhone, Chia sẻ, Thêm vào Màn hình chính.
3. Mỗi thiết bị có dữ liệu riêng (không đồng bộ). Hãy tạo mã sao lưu định kỳ.
4. Mỗi lần sửa code, tăng số phiên bản `CACHE` trong `sw.js` (và thêm tệp mới vào `FILES`) để máy người dùng nhận bản mới.

## Lưu ý và việc có thể làm tiếp
- Phông Google Fonts được service worker lưu lại sau lần tải đầu, lần sau dùng được ngoại tuyến. Muốn chắc chắn hơn, tải phông về `assets/fonts/` và dùng `@font-face`.
- Hoạt ảnh bị tắt khi thiết bị bật chế độ giảm chuyển động.
- Danh hiệu theo cấp: Tân binh (1), Chiến binh (3), Hiệp sĩ (6), Anh hùng (10), Huyền thoại (15); chỉnh trong `RANKS` ở `js/views.js` và viền ở cuối `style.css`.
- Gợi ý tiếp: đồng bộ nhiều thiết bị bằng máy chủ riêng, thêm loại quà và hiệu ứng mới, ảnh nhân vật khác nhau theo cấp, nhiệm vụ lặp theo thứ trong tuần.
