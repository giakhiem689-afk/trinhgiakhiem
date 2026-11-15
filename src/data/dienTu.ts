// Nội dung tab "Điện tử cơ bản" — bám theo giáo trình MĐ13 (trình độ trung cấp).
// Mỗi phần (section) có một mô phỏng tương tác; `id` là neo để dẫn link trực tiếp:
//   /du-an/dien-tu-co-ban/<slug>#<id>

export interface DtSection {
  id: string;          // neo trên trang và khóa của mô phỏng (data-sim)
  title: string;
  ref: string;         // vị trí tương ứng trong giáo trình
  kind: 'Mạch điện' | 'Kỹ năng đọc' | 'Kỹ năng đo' | 'Khái niệm' | 'Tính toán' | 'Xử lý lỗi';
  task: string;        // việc người học cần làm với mô phỏng
  watch: string[];     // điều cần quan sát
  qa: [string, string][]; // câu hỏi dự đoán và gợi ý (câu đầu dùng cho bước Dự đoán)
  teach: string;       // gợi ý tổ chức cho người dạy
}

export interface DtLesson {
  slug: string;
  short: string;       // nhãn ngắn trên thanh chọn bài
  title: string;
  hours: string;
  goal: string;
  sections: DtSection[];
}

export const dtCourse = {
  base: '/du-an/dien-tu-co-ban',
  title: 'Điện tử cơ bản',
  subtitle: 'Mô đun MĐ13 · Trình độ trung cấp · 90 giờ',
  intro:
    'Bộ bài học tương tác đi kèm giáo trình Điện tử cơ bản MĐ13. Mỗi phần là một mô phỏng chạy ngay trên trình duyệt: kéo thanh trượt, bấm nút, quan sát dòng điện và dạng sóng thay đổi, rồi đối chiếu với mạch thật trong giờ thực hành.',
  steps: [
    ['Dự đoán', 'Đọc câu hỏi và ghi dự đoán ra giấy trước khi chạm vào mô phỏng.'],
    ['Thử', 'Thay một thông số mỗi lần, xem con số và hình vẽ đổi theo chiều nào.'],
    ['Lắp và đo', 'Lắp mạch thật, đo ở đúng điểm đo và điều kiện tải.'],
    ['So sánh', 'Giải thích vì sao số đo khác mô phỏng: dung sai, nhiệt, tiếp xúc, dụng cụ.'],
  ] as [string, string][],
};

export const dtLessons: DtLesson[] = [
  {
    slug: 'dung-cu-do',
    short: 'Dụng cụ đo',
    title: 'Dụng cụ đo và cách đo an toàn',
    hours: 'Dùng xuyên suốt các bài',
    goal: 'Chọn đúng chức năng và cách mắc đồng hồ vạn năng, đọc được biên độ và tần số trên dao động ký trước khi bước vào các bài thực hành.',
    sections: [
      {
        id: 'dong-ho-van-nang',
        teach: 'Cho cả lớp giơ tay chọn “đúng hay sai” trước mỗi tổ hợp. Dừng lâu ở trường hợp ampe kế mắc song song nguồn, vì đây là lỗi làm cháy cầu chì đồng hồ thường gặp nhất.',
        title: 'Đồng hồ vạn năng: chọn chức năng và cách mắc',
        ref: 'An toàn trước khi thực hành; Phụ lục A',
        kind: 'Kỹ năng đo',
        task: 'Chọn chức năng đo, vị trí đặt que và trạng thái nguồn. Màn hình đồng hồ cho biết số đo sẽ thấy, kèm nhận xét cách đo đó đúng hay sai và vì sao.',
        watch: [
          'Đo điện áp: mắc song song với linh kiện, mạch đang có điện.',
          'Đo dòng: phải cắt nhánh và mắc nối tiếp; mắc song song là nối tắt.',
          'Đo điện trở: ngắt nguồn, và tháo một chân nếu có nhánh song song.',
        ],
        qa: [
          ['Vì sao không đo điện trở khi mạch đang cấp nguồn?', 'Nguồn ngoài làm sai phép đo và có thể làm hỏng đồng hồ ở thang Ω. Tụ trong mạch còn điện cũng gây nguy hiểm; phải ngắt nguồn và xác nhận đã xả.'],
          ['Đo R₂ = 2,2 kΩ ngay trên mạch mà đồng hồ chỉ 688 Ω. Linh kiện có hỏng không?', 'Chưa chắc. R₁ và nguồn tạo thành nhánh song song với R₂ nên số đo thấp hơn. Tháo một chân của R₂ rồi đo lại mới kết luận được.'],
          ['Sau khi đo dòng xong phải làm gì với que đỏ?', 'Trả que đỏ về cổng VΩ. Nếu để ở cổng dòng rồi đem đo điện áp, đồng hồ sẽ nối tắt điểm đo.'],
        ],
      },
      {
        id: 'dao-dong-ky',
        teach: 'Giao mỗi nhóm ba tín hiệu và yêu cầu ghi số ô trước khi nhân. Lỗi thường gặp là đọc biên độ đỉnh thay cho đỉnh–đỉnh.',
        title: 'Đọc dao động ký: biên độ và tần số',
        ref: 'Các bài 3, 5, 6, 7 (quan sát dạng sóng)',
        kind: 'Kỹ năng đọc',
        task: 'Chỉnh hai núm V/div và thời gian/div để hình vừa màn hình, đếm số ô rồi nhập điện áp đỉnh–đỉnh và tần số. Bấm “Tín hiệu mới” để luyện tiếp.',
        watch: [
          'Mỗi ô dọc ứng với giá trị đang đặt ở núm V/div.',
          'Một chu kỳ dài bao nhiêu ô ngang thì nhân với thời gian/div.',
          'Hình càng chiếm nhiều ô (nhưng không tràn màn hình) thì đọc càng chính xác.',
        ],
        qa: [
          ['Sóng cao 4 ô ở 0,5 V/div và một chu kỳ dài 5 ô ở 0,2 ms/div. Vpp và f bằng bao nhiêu?', 'Vpp = 4 × 0,5 = 2 V. T = 5 × 0,2 ms = 1 ms nên f = 1 kHz.'],
          ['Kẹp mass của que đo dao động ký được kẹp vào đâu?', 'Chỉ kẹp vào điểm 0 V của mạch cách ly đã xác nhận. Kẹp mass có thể nối đất bảo vệ nên không tùy ý kẹp vào hai điểm có điện thế khác nhau.'],
        ],
      },
    ],
  },
  {
    slug: 'bai-1',
    short: 'Bài 1',
    title: 'Linh kiện thụ động',
    hours: '2 giờ lý thuyết · 2 giờ thực hành',
    goal: 'Đọc trị số điện trở, tụ điện; tính mạch chia áp và mạch RC; hiểu vì sao tải cảm cần diode dập xung.',
    sections: [
      {
        id: 'ma-mau',
        teach: 'Phát điện trở thật để đọc song song với mô phỏng. Lỗi thường gặp là đọc ngược chiều và nhầm vạch hệ số nhân thành một chữ số.',
        title: 'Đọc mã màu điện trở',
        ref: 'Mục 1.1, Bảng 1.1',
        kind: 'Kỹ năng đọc',
        task: 'Chọn màu cho từng vạch và xem trị số, dung sai, khoảng giá trị chấp nhận. Sau đó bấm “Cho tôi một trị số” để tự chọn vạch cho một điện trở bất kỳ.',
        watch: [
          'Điện trở 4 vạch: hai chữ số, hệ số nhân, dung sai. Điện trở 5 vạch có thêm chữ số thứ ba.',
          'Vàng kim và bạc chỉ dùng cho hệ số nhân nhỏ hoặc dung sai, không dùng làm chữ số.',
          'Khoảng chấp nhận rộng hay hẹp là do vạch dung sai quyết định.',
        ],
        qa: [
          ['Điện trở bốn vạch nâu, đen, đỏ, vàng kim có trị số bao nhiêu? Đo được 982 Ω thì có đạt không?', '10 × 10² Ω = 1 kΩ, dung sai ±5%, tức từ 950 Ω đến 1 050 Ω. Số đo 982 Ω nằm trong khoảng nên đạt về trị số.'],
          ['Làm sao biết đọc từ đầu nào?', 'Vạch dung sai thường nằm xa các vạch còn lại, và vạch đầu tiên không bao giờ là đen, vàng kim hay bạc. Nếu vẫn không rõ, đo xác nhận bằng đồng hồ.'],
        ],
      },
      {
        id: 'ma-so',
        teach: 'Hỏi nhanh hai mã “100” và “101” để gỡ ngộ nhận rằng số cuối là một chữ số của trị số. Cho học viên tự tìm mã trên bo mạch cũ.',
        title: 'Đọc mã số trên điện trở dán và tụ điện',
        ref: 'Mục 1.1 và 1.3',
        kind: 'Kỹ năng đọc',
        task: 'Nhập mã in trên thân linh kiện hoặc bấm các mã mẫu. Mô phỏng tách mã thành chữ số có nghĩa và số mũ, rồi đổi ra đơn vị thường dùng.',
        watch: [
          'Chữ số cuối là số mũ của 10, không phải một chữ số của trị số.',
          'Chữ R trên điện trở dán thay cho dấu thập phân.',
          'Mã ba chữ số của tụ tính theo picofarad: 104 là 100 nF.',
        ],
        qa: [
          ['Điện trở dán ghi “100” có phải 100 Ω không?', 'Không. 10 × 10⁰ = 10 Ω. Điện trở 100 Ω được ghi là “101”.'],
          ['Tụ gốm ghi “104” có điện dung bao nhiêu?', '10 × 10⁴ pF = 100 000 pF = 100 nF = 0,1 µF.'],
        ],
      },
      {
        id: 'chia-ap',
        teach: 'Yêu cầu ghi dự đoán Ura trước khi bấm “Nối tải”. Liên hệ với điện trở vào của đồng hồ và lý do cần bộ đệm ở bài 7.',
        title: 'Cầu chia áp và ảnh hưởng của tải',
        ref: 'Mục 1.2, Hình 1.1, Ví dụ 2',
        kind: 'Mạch điện',
        task: 'Bấm “Nối tải” rồi kéo Rtải từ 1 kΩ đến 1 MΩ. Theo dõi điện áp Ura và cách dòng điện tách nhánh tại nút ra.',
        watch: [
          'Không tải, Ura đúng bằng một nửa điện áp nguồn.',
          'Nối tải 10 kΩ làm Ura tụt từ 5 V xuống khoảng 3,33 V.',
          'Tải càng lớn so với R₂ thì sai lệch càng nhỏ.',
        ],
        qa: [
          ['Nối tải 10 kΩ vào cầu 10 kΩ–10 kΩ, nguồn 10 V thì Ura còn bao nhiêu?', 'R₂ song song Rtải còn 5 kΩ nên Ura = 10 × 5/(10 + 5) ≈ 3,33 V; dòng nguồn tăng từ 0,5 mA lên khoảng 0,667 mA.'],
          ['Vì sao đồng hồ vạn năng số gần như không làm sai điện áp này?', 'Điện trở vào của đồng hồ cỡ 10 MΩ, lớn hơn R₂ một nghìn lần, nên nó lấy dòng không đáng kể.'],
        ],
      },
      {
        id: 'tu-nap-xa',
        teach: 'Cho học viên đọc τ trên đồ thị rồi so với tích R·C. Nhấn mạnh dòng lớn nhất lúc bắt đầu nạp, không phải lúc tụ đầy.',
        title: 'Tụ điện nạp và xả qua điện trở',
        ref: 'Mục 1.3, Hình 1.2, Ví dụ 3',
        kind: 'Mạch điện',
        task: 'Bấm “Nạp”, chờ tụ đầy rồi bấm “Xả”. Thay R và C để thấy hằng số thời gian τ = RC quyết định tốc độ.',
        watch: [
          'Dòng lớn nhất ngay lúc bắt đầu nạp rồi giảm dần về 0.',
          'Sau một τ, điện áp tụ đạt khoảng 63,2% giá trị cuối.',
          'Sau khoảng năm τ, tụ được xem là đã nạp đầy.',
        ],
        qa: [
          ['R = 10 kΩ, C = 10 µF, nguồn 5 V. Sau 0,10 s điện áp tụ là bao nhiêu?', 'τ = 0,10 s nên sau 0,10 s tụ đạt khoảng 63,2% của 5 V, tức 3,16 V.'],
          ['Tăng C gấp đôi thì đường cong thay đổi thế nào?', 'τ tăng gấp đôi: đường cong có cùng hình dạng nhưng kéo dài gấp đôi theo trục thời gian.'],
        ],
      },
      {
        id: 'tai-cam',
        teach: 'Hỏi vì sao transistor có thể hỏng dù nguồn chỉ 12 V, rồi mới cho xem đỉnh 60 V khi không có diode.',
        title: 'Tải cảm và diode dập xung',
        ref: 'Mục 1.4',
        kind: 'Khái niệm',
        task: 'Bấm “Ngắt transistor” trong hai trường hợp có và không có diode. So sánh đỉnh điện áp trên collector và thời gian dòng cuộn dây tắt hẳn.',
        watch: [
          'Dòng qua cuộn dây không thể dừng tức thời.',
          'Không có diode: điện áp vọt lên đến mức đánh thủng transistor.',
          'Có diode: điện áp chỉ cao hơn nguồn khoảng 0,7 V, nhưng dòng tắt chậm hơn nên rơle nhả chậm hơn.',
        ],
        qa: [
          ['Diode dập xung mắc theo chiều nào?', 'Mắc song song cuộn dây, bình thường bị phân cực ngược: cathode về phía dương nguồn, anode về phía transistor.'],
          ['Vì sao có diode thì rơle nhả chậm hơn?', 'Diode cho dòng cuộn dây tiếp tục chạy vòng và suy giảm từ từ, nên từ trường mất chậm hơn.'],
        ],
      },
    ],
  },
  {
    slug: 'bai-2',
    short: 'Bài 2',
    title: 'Linh kiện bán dẫn',
    hours: '2 giờ lý thuyết · 2 giờ thực hành',
    goal: 'Hiểu tiếp giáp PN, tính điện trở cho LED, dùng BJT và MOSFET làm công tắc, nhận dạng chân BJT bằng đồng hồ.',
    sections: [
      {
        id: 'tiep-giap-pn',
        teach: 'Kéo thật chậm từ 0,5 V đến 0,7 V để thấy đường cong dựng đứng. Tránh để học viên ghi nhớ “0,7 V” như một hằng số.',
        title: 'Tiếp giáp PN và đường đặc tính diode',
        ref: 'Mục 2.1 và 2.2',
        kind: 'Khái niệm',
        task: 'Kéo điện áp từ −5 V lên 0,74 V. Quan sát vùng nghèo rộng ra hay hẹp lại, các hạt tải chuyển động và điểm làm việc chạy trên đường đặc tính.',
        watch: [
          'Phân cực ngược: vùng nghèo rộng ra, chỉ còn dòng rò rất nhỏ.',
          'Phân cực thuận: vùng nghèo hẹp lại, dòng tăng rất nhanh khi vượt khoảng 0,6 V.',
          'Điện áp thuận không cố định ở 0,7 V mà tăng dần theo dòng.',
        ],
        qa: [
          ['Vì sao nói “diode silicon rơi đúng 0,7 V” chỉ là quy tắc ước lượng?', 'Điện áp thuận thay đổi theo dòng, nhiệt độ và loại diode. Tính sơ bộ có thể lấy 0,6–0,8 V, còn thiết kế phải dựa vào datasheet.'],
          ['Đồng hồ báo hai chiều của diode đều gần 0 V cho thấy điều gì?', 'Diode có thể bị chập, hoặc đang bị một nhánh song song trong mạch làm sai số đo. Tháo một chân để đo lại trước khi thay.'],
        ],
      },
      {
        id: 'led',
        teach: 'Giao mỗi nhóm một bộ số liệu khác nhau, tính tay trước rồi mới đối chiếu. Hỏi vì sao chọn giá trị chuẩn lớn hơn chứ không nhỏ hơn.',
        title: 'Tính điện trở hạn dòng cho LED',
        ref: 'Mục 2.2; câu 1 phần ôn tập',
        kind: 'Tính toán',
        task: 'Chọn màu LED, điện áp nguồn và dòng mong muốn. Mô phỏng tính R, chọn giá trị chuẩn gần nhất theo hướng an toàn và cho biết công suất trên điện trở.',
        watch: [
          'LED lam và trắng có điện áp thuận cao hơn LED đỏ.',
          'Giá trị chuẩn được chọn bằng hoặc lớn hơn giá trị tính, nên dòng thực hơi nhỏ hơn.',
          'Độ sáng của LED trên hình thay đổi theo dòng thực.',
        ],
        qa: [
          ['Nguồn 5 V, LED đỏ 2,0 V, dòng 8 mA cần điện trở bao nhiêu?', 'R = (5 − 2,0)/0,008 = 375 Ω; chọn giá trị chuẩn 390 Ω.'],
          ['Nguồn 12 V, LED có UF = 2,1 V, dòng 8 mA thì chọn điện trở nào và công suất bao nhiêu?', 'R ≈ 1 238 Ω, chọn 1,3 kΩ. Dòng thực khoảng 7,6 mA, công suất khoảng 0,075 W nên điện trở 0,25 W là đủ.'],
        ],
      },
      {
        id: 'bjt-cong-tac',
        teach: 'Giữ nguyên tải, chỉ tăng RB cho đến khi trạng thái đổi sang “Khuếch đại”. Đó là lúc giải thích β cưỡng bức.',
        title: 'BJT làm công tắc đóng cắt rơle',
        ref: 'Mục 2.3, Hình 2.1, Ví dụ 1',
        kind: 'Mạch điện',
        task: 'Thay RB, hFE và điện áp điều khiển để đưa transistor qua ba miền: ngắt, khuếch đại và bão hòa. Bấm “Ngắt đột ngột” để thấy dòng tự cảm chạy vòng qua diode.',
        watch: [
          'Dòng base nhỏ điều khiển dòng collector lớn hơn nhiều lần.',
          'Ở miền bão hòa, dòng collector do tải quyết định, VCE chỉ còn khoảng 0,15 V.',
          'Ở miền khuếch đại, VCE còn lớn nên transistor tiêu tán nhiều nhiệt.',
        ],
        qa: [
          ['Tăng RB lên 10 lần thì transistor còn bão hòa không?', 'Dòng base giảm 10 lần. Nếu hFE × IB nhỏ hơn dòng rơle cần, transistor rơi vào miền khuếch đại: rơle hút yếu, transistor nóng.'],
          ['Vì sao Ví dụ 1 chọn β cưỡng bức bằng 10?', 'Để dòng base lớn hơn nhiều so với IC chia cho hFE nhỏ nhất, transistor bão hòa chắc chắn dù hFE thay đổi theo linh kiện và nhiệt độ.'],
        ],
      },
      {
        id: 'mosfet',
        teach: 'Dừng ở VGS = 2,2 V để học viên thấy tổn hao 0,8 W. Đây là bằng chứng VGS(th) không phải điện áp mở hoàn toàn.',
        title: 'MOSFET làm công tắc cho quạt',
        ref: 'Mục 2.4; câu 2 phần ôn tập',
        kind: 'Mạch điện',
        task: 'Kéo điện áp cổng VGS từ 0 đến 10 V. Theo dõi dòng qua quạt, sụt áp VDS và tổn hao trên MOSFET.',
        watch: [
          'Dưới ngưỡng VGS(th), MOSFET tắt hoàn toàn.',
          'Ngay trên ngưỡng, MOSFET chỉ dẫn một phần: quạt quay yếu và MOSFET rất nóng.',
          'Ở 5 V, MOSFET logic-level dẫn hoàn toàn, tổn hao chỉ vài mW.',
        ],
        qa: [
          ['Vì sao VGS(th) không đủ để chọn MOSFET cho quạt?', 'VGS(th) chỉ cho biết lúc bắt đầu có một dòng thử rất nhỏ. Muốn đóng cắt tải phải xem RDS(on) được bảo đảm ở đúng điện áp điều khiển.'],
          ['Điện trở kéo xuống ở cổng để làm gì?', 'Giữ MOSFET tắt khi dây điều khiển hở, vì cổng MOSFET có thể tích điện và tự dẫn.'],
        ],
      },
      {
        id: 'do-kiem-bjt',
        teach: 'Tổ chức thi tìm đúng với ít lần đo nhất. Yêu cầu ghi đủ bảng sáu phép đo trước khi kết luận.',
        title: 'Dò chân BJT bằng thang diode',
        ref: 'Mục 2.5 và 2.6',
        kind: 'Kỹ năng đo',
        task: 'Một transistor chưa biết loại và thứ tự chân. Đặt que đỏ, que đen lần lượt vào các cặp chân, đọc số đo, rồi kết luận loại NPN hay PNP, chân base và chân emitter.',
        watch: [
          'BJT giống hai tiếp giáp PN chung nhau chân base.',
          'Chân nào cho số đo với cả hai chân còn lại là base.',
          'Tiếp giáp B–E thường cho số đo hơi cao hơn B–C.',
        ],
        qa: [
          ['Que đỏ ở base cho số đo với hai chân kia thì là loại gì?', 'NPN, vì base là vùng P nên que dương đặt ở base làm hai tiếp giáp phân cực thuận.'],
          ['Phép thử này có thay được việc tra datasheet không?', 'Không. Nó chỉ sàng lọc hỏng rõ ràng và nhận dạng sơ bộ; sơ đồ chân và giới hạn vẫn phải lấy từ datasheet của đúng mã linh kiện.'],
        ],
      },
    ],
  },
  {
    slug: 'bai-3',
    short: 'Bài 3',
    title: 'Mạch nguồn một chiều',
    hours: '3 giờ lý thuyết · 9 giờ thực hành',
    goal: 'Chỉ ra đường dòng trong mạch chỉnh lưu, ước lượng điện áp và độ gợn sau tụ lọc, chọn bề rộng đường mạch in.',
    sections: [
      {
        id: 'cau-chinh-luu',
        teach: 'Bấm “Tạm dừng” ở mỗi nửa chu kỳ và gọi học viên lên chỉ đường dòng. Đối chiếu tên nút A, B, P, N với Hình 3.1.',
        title: 'Đường dòng trong mạch chỉnh lưu',
        ref: 'Mục 3.1, Hình 3.1',
        kind: 'Mạch điện',
        task: 'Xem dòng điện đổi đường đi qua từng cặp diode theo mỗi nửa chu kỳ. Bấm “Tạm dừng” để dừng hình, và chuyển sang chỉnh lưu bán kỳ để so sánh.',
        watch: [
          'Nửa chu kỳ A dương: dòng đi A → D1 → P → tải → N → D4 → B.',
          'Nửa chu kỳ B dương: dòng đi B → D2 → P → tải → N → D3 → A.',
          'Dòng qua tải luôn cùng một chiều dù nguồn đổi chiều.',
        ],
        qa: [
          ['Trong mạch cầu, mỗi lúc có mấy diode dẫn?', 'Hai diode nối tiếp, nên điện áp trên tải thấp hơn đỉnh nguồn khoảng hai lần sụt áp diode.'],
          ['Chỉnh lưu bán kỳ kém mạch cầu ở điểm nào?', 'Chỉ dùng được một nửa chu kỳ: mỗi chu kỳ có một xung thay vì hai, điện áp trung bình thấp hơn và khó lọc phẳng hơn.'],
        ],
      },
      {
        id: 'tu-loc',
        teach: 'Tháo tụ rồi lắp lại để thấy tác dụng lọc. Cho học viên đoán độ gợn khi tải tăng gấp đôi rồi mới kéo thanh trượt.',
        title: 'Tụ lọc và độ gợn',
        ref: 'Mục 3.2, 3.3 và 3.6',
        kind: 'Mạch điện',
        task: 'Thay tụ lọc và tải, bấm “Tháo tụ lọc” để thấy dạng sóng trước khi lọc. So sánh độ gợn đo được với công thức ΔUpp ≈ Itải/(100·C).',
        watch: [
          'Tụ chỉ được nạp trong khoảng ngắn gần đỉnh, khi cầu diode dẫn.',
          'Giữa hai đỉnh, tụ một mình nuôi tải nên điện áp giảm dần.',
          'Tải càng nặng hoặc tụ càng nhỏ thì gợn càng lớn.',
        ],
        qa: [
          ['Nguồn 9 V AC có cho đúng 9 V DC không?', 'Không. 9 V là giá trị hiệu dụng; đỉnh khoảng 12,7 V trước khi trừ sụt áp diode. Điện áp sau lọc còn phụ thuộc tải và độ gợn.'],
          ['Với 12 V AC, tải 1 A, tụ 3 300 µF cho gợn bao nhiêu?', 'Khoảng 3 Vpp theo công thức gần đúng. Mô phỏng cho số nhỏ hơn một chút vì tụ chỉ xả trong phần chu kỳ diode khóa.'],
          ['Tăng tụ lọc có hai tác dụng trái chiều nào?', 'Giảm độ gợn, nhưng làm dòng nạp xung và dòng khởi động lớn hơn, tăng ứng suất lên diode, biến áp và đường mạch.'],
        ],
      },
      {
        id: 'duong-mach',
        teach: 'Dùng ngay trước khi vẽ mạch in sản phẩm ở mục 3.6. Phân biệt rõ “đủ về điện” với “gia công được”.',
        title: 'Bề rộng đường mạch in',
        ref: 'Mục 3.5, 3.6 (bước 3); Phụ lục C',
        kind: 'Tính toán',
        task: 'Nhập dòng điện, độ dày đồng và mức tăng nhiệt cho phép để tìm bề rộng tối thiểu. So sánh với bề rộng định vẽ và xem sụt áp trên đường mạch.',
        watch: [
          'Dòng 1 A chỉ cần đường đồng rất hẹp nếu xét riêng về nhiệt.',
          'Đường dài và hẹp gây sụt áp, quan trọng với mạch đo và mạch nguồn.',
          'Bo gia công thủ công cần rộng hơn nhiều so với mức tối thiểu.',
        ],
        qa: [
          ['Vì sao bo tự làm vẫn vẽ đường nguồn 1,5–2,5 mm dù công thức chỉ đòi khoảng 0,3 mm?', 'Để bù sai số ăn mòn, giảm sụt áp và bền cơ khí khi hàn, khoan. Bề rộng không chỉ phụ thuộc dòng điện.'],
          ['DRC báo không lỗi có chứng minh mạch in hoạt động không?', 'Không. DRC chỉ kiểm tra quy tắc hình học và kết nối đã khai báo; sai nguyên lý, sai footprint hay đảo cực vẫn có thể tồn tại.'],
        ],
      },
    ],
  },
  {
    slug: 'bai-4',
    short: 'Bài 4',
    title: 'Mạch ổn áp',
    hours: '4 giờ lý thuyết · 8 giờ thực hành',
    goal: 'Cân bằng dòng trong mạch ổn áp Zener và tính nhiệt cho IC ổn áp tuyến tính.',
    sections: [
      {
        id: 'zener',
        teach: 'Giảm Rtải từ từ cho đến khi dòng Zener về 0. Yêu cầu lập bảng bốn trường hợp nguồn và tải như trong giờ thực hành.',
        title: 'Ổn áp song song dùng Zener',
        ref: 'Mục 4.2, Ví dụ 1',
        kind: 'Mạch điện',
        task: 'Thay điện áp vào, Rs và tải. Theo dõi dòng qua Rs tách thành dòng Zener và dòng tải, và tìm điểm mạch mất ổn áp.',
        watch: [
          'Dòng qua Rs luôn bằng dòng Zener cộng dòng tải.',
          'Tải lấy thêm dòng thì Zener nhường bớt dòng, Ura vẫn giữ 5,1 V.',
          'Khi dòng Zener về 0, Ura tụt theo cầu chia Rs và tải.',
        ],
        qa: [
          ['Rs = 470 Ω, nguồn 12 V, tải 10 mA. Dòng qua Rs và dòng Zener là bao nhiêu?', 'IRs = (12 − 5,1)/470 ≈ 14,7 mA; IZ ≈ 4,7 mA.'],
          ['Tải nhẹ thì linh kiện nào nóng hơn?', 'Zener, vì nó nhận phần dòng mà tải không lấy. Công suất Zener lớn nhất khi không tải và điện áp vào cao nhất.'],
        ],
      },
      {
        id: 'on-ap-ic',
        teach: 'Bật “Phân tầng” và hỏi tổng nhiệt có giảm không. Ngộ nhận phổ biến là phân tầng làm bộ nguồn mát hơn.',
        title: 'Nhiệt trên IC ổn áp L7805',
        ref: 'Mục 4.4 và 4.7 (bước 1)',
        kind: 'Tính toán',
        task: 'Thay điện áp vào, dòng tải và loại tản nhiệt để xem nhiệt độ tiếp giáp ước tính. Bật “Phân tầng” để thấy nhiệt được chia sang L7812 như thế nào.',
        watch: [
          'Phần điện áp dư nhân với dòng tải biến hoàn toàn thành nhiệt.',
          'Không gắn tản nhiệt, vỏ TO-220 chỉ chịu được khoảng 1,5 W.',
          'Phân tầng làm L7805 mát hơn nhưng tổng nhiệt của bộ nguồn không giảm.',
        ],
        qa: [
          ['L7805 nhận 12 V và cấp 0,2 A tiêu tán bao nhiêu, hiệu suất bao nhiêu?', 'P ≈ (12 − 5) × 0,2 = 1,4 W; hiệu suất khoảng 5/12 ≈ 42%.'],
          ['Vì sao phải xét đáy gợn ở đầu vào chứ không xét giá trị trung bình?', 'IC chỉ điều khiển được khi điện áp tức thời ở đầu vào đủ cao. Giá trị trung bình có thể che mất thời điểm đáy làm IC rơi khỏi vùng ổn áp.'],
        ],
      },
    ],
  },
  {
    slug: 'bai-5',
    short: 'Bài 5',
    title: 'Mạch dao động',
    hours: '3 giờ lý thuyết · 7 giờ thực hành · 2 giờ kiểm tra',
    goal: 'Giải thích từng bước chuyển trạng thái của mạch đa hài và kiểm tra điều kiện bão hòa khi dùng mạch này lái rơle.',
    sections: [
      {
        id: 'da-hai',
        teach: 'Cho học viên kể đủ sáu bước chuyển trạng thái bằng lời, rồi mới chiếu dạng sóng base xuống điện áp âm.',
        title: 'Đa hài tự dao động dùng hai BJT',
        ref: 'Mục 5.2, Hình 5.1, Ví dụ 1 và 2',
        kind: 'Mạch điện',
        task: 'Thay R, C1, C2 và theo dõi hai LED chớp luân phiên cùng dạng sóng ở collector và base. Thử đặt hai tụ khác nhau để thấy chu kỳ mất đối xứng.',
        watch: [
          'Khi một transistor vừa dẫn, base của transistor kia bị kéo xuống điện áp âm.',
          'Tụ nạp dần qua R; khi base lên đến khoảng 0,7 V thì mạch đảo trạng thái.',
          'Mỗi nửa chu kỳ dài gần 0,693·R·C của nhánh tương ứng.',
        ],
        qa: [
          ['R = 68 kΩ, C = 10 µF cho chu kỳ bao nhiêu?', 'T ≈ 1,386 × 68 000 × 10 µF ≈ 0,94 s, tần số khoảng 1,06 Hz.'],
          ['Thay C1 bằng 22 µF thì LED nào sáng lâu hơn?', 'LED1, vì C1 giữ Q2 tắt trong thời gian dài hơn nên Q1 dẫn lâu hơn.'],
          ['Khi chỉ một transistor dẫn mãi, nên đổi chéo linh kiện nào để tìm lỗi?', 'Đổi chéo hai tụ trước, rồi đến hai transistor, và quan sát lỗi có đổi bên hay không.'],
        ],
      },
      {
        id: 'da-hai-role',
        teach: 'Chọn TIP41C với RB = 33 kΩ để xuất hiện cảnh báo, rồi cho các nhóm tự tìm cặp RB và C sửa được mà vẫn giữ thời gian.',
        title: 'Đa hài lái rơle 24 V: kiểm tra bão hòa',
        ref: 'Mục 5.5 (bước 1)',
        kind: 'Tính toán',
        task: 'Chọn transistor, RB, tụ và rơle. So sánh hFE nhỏ nhất mà nhà sản xuất bảo đảm với β cưỡng bức của mạch để biết transistor có chắc chắn bão hòa hay không.',
        watch: [
          'RB vừa quyết định thời gian, vừa quyết định dòng base.',
          'TIP41C chỉ bảo đảm hFE từ 30: với RB = 33 kΩ không chắc bão hòa.',
          'Muốn dùng transistor hFE thấp phải giảm RB và tăng C để giữ nguyên thời gian.',
        ],
        qa: [
          ['Vì sao không lấy con số hFE lớn nhất trong datasheet để tính?', 'Vì đó không phải giá trị được bảo đảm. Thiết kế phải đúng với cả linh kiện có hFE thấp nhất.'],
          ['Ở nguồn 24 V cần thêm diode nối tiếp cực base để làm gì?', 'Khi một transistor vừa dẫn, base của transistor kia bị kéo xuống khoảng −23 V, vượt xa điện áp ngược B–E cho phép (khoảng 5 V). Diode chặn điện áp ngược này.'],
        ],
      },
    ],
  },
  {
    slug: 'bai-6',
    short: 'Bài 6',
    title: 'Mạch định thời dùng IC 555',
    hours: '4 giờ lý thuyết · 8 giờ thực hành',
    goal: 'Giải thích hoạt động của NE555 qua hai ngưỡng 1/3 và 2/3 VCC, tính và kiểm tra mạch đa hài và mạch đơn ổn.',
    sections: [
      {
        id: 'astable',
        teach: 'Che phần số đo, yêu cầu đoán LED sáng lâu hơn hay tắt lâu hơn. Sau đó gắn RA, RB vào từng đường nạp và xả.',
        title: 'NE555 đa hài (astable)',
        ref: 'Mục 6.1 và 6.2, Hình 6.2, Ví dụ 1',
        kind: 'Mạch điện',
        task: 'Thay RA, RB, C. Theo dõi tụ nạp qua RA + RB rồi xả qua RB, và xem các khối bên trong IC đổi trạng thái tại hai ngưỡng.',
        watch: [
          'Điện áp tụ chỉ chạy giữa 1/3 và 2/3 VCC.',
          'Tụ nạp qua RA + RB nhưng xả chỉ qua RB, nên mức cao dài hơn mức thấp.',
          'OUT đổi trạng thái đúng lúc điện áp tụ chạm một trong hai ngưỡng.',
        ],
        qa: [
          ['RA = 10 kΩ, RB = 68 kΩ, C = 1 µF cho tần số và duty cycle bao nhiêu?', 'T ≈ 0,693 × 146 kΩ × 1 µF ≈ 0,101 s nên f ≈ 9,9 Hz; duty cycle khoảng 53,4%.'],
          ['Tăng RB thì tần số và duty cycle đổi theo chiều nào?', 'Tần số giảm; duty cycle tiến gần 50% vì RA ngày càng nhỏ so với RB.'],
          ['Vì sao không để hở chân RESET?', 'RESET là ngõ vào ưu tiên; nhiễu trên chân hở có thể reset mạch bất chợt. Không dùng thì nối lên mức cao.'],
        ],
      },
      {
        id: 'monostable',
        teach: 'Cho học viên bấm trigger liên tục để tự phát hiện mạch không nhận trigger khi đang có xung.',
        title: 'NE555 đơn ổn (monostable)',
        ref: 'Mục 6.3, Ví dụ 2',
        kind: 'Mạch điện',
        task: 'Bấm “Nhấn trigger” để tạo một xung. Thay R và C để đổi độ rộng xung, và thử bấm thêm khi xung chưa kết thúc.',
        watch: [
          'Mỗi lần trigger chỉ tạo đúng một xung.',
          'Xung kết thúc khi điện áp tụ lên đến 2/3 VCC.',
          'Độ rộng xung gần bằng 1,1·R·C.',
        ],
        qa: [
          ['R = 100 kΩ, C = 10 µF cho xung dài bao lâu?', 'tW ≈ 1,1 × 100 000 × 10 µF = 1,1 s.'],
          ['Vì sao nút nhấn cơ khí có thể tạo nhiều xung ngoài ý muốn?', 'Tiếp điểm cơ khí bị dội nên sinh nhiều xung trigger liên tiếp; cần mạng chống dội hoặc nguồn trigger sạch.'],
        ],
      },
    ],
  },
  {
    slug: 'bai-7',
    short: 'Bài 7',
    title: 'Khuếch đại thuật toán',
    hours: '4 giờ lý thuyết · 12 giờ thực hành',
    goal: 'Tính độ lợi của mạch đảo và không đảo, nhận ra các giới hạn làm công thức hết đúng, và hiểu tác dụng của hysteresis.',
    sections: [
      {
        id: 'khuech-dai',
        teach: 'Lần lượt tạo ba kiểu sai: cắt đỉnh, méo do slew rate, giảm độ lợi. Với mỗi kiểu, yêu cầu nêu bằng chứng trên dạng sóng.',
        title: 'Mạch đảo, không đảo và các giới hạn',
        ref: 'Mục 7.2 và 7.3, Hình 7.1 và 7.2',
        kind: 'Mạch điện',
        task: 'Chọn cấu hình, thay Rf, biên độ, tần số và nguồn. Tìm ba cách làm công thức độ lợi hết đúng: cắt đỉnh, méo do slew rate và giảm độ lợi ở tần số cao.',
        watch: [
          'Mạch đảo cho ngõ ra ngược pha; mạch không đảo cùng pha.',
          'Ngõ ra không thể vượt giới hạn nguồn: đỉnh sin bị cắt phẳng.',
          'Tần số cao và biên độ lớn làm sóng sin thành cạnh xiên do slew rate.',
        ],
        qa: [
          ['Rin = 10 kΩ, Rf = 47 kΩ, vào 0,2 V đỉnh thì ra bao nhiêu?', 'Av = −4,7 nên ngõ ra 0,94 V đỉnh và đảo pha.'],
          ['Mạch không đảo có độ lợi 11, đưa 1 V vào với nguồn 5 V có ra được 11 V không?', 'Không. Công thức chỉ đúng khi op amp còn làm việc tuyến tính trong giới hạn nguồn.'],
          ['Sin 20 kHz, 3 V đỉnh cần slew rate tối thiểu bao nhiêu?', 'SR ≈ 2π × 20 000 × 3 ≈ 0,377 V/µs, cần thêm dự phòng.'],
        ],
      },
      {
        id: 'hysteresis',
        teach: 'Để hysteresis bằng 0 và tăng nhiễu trước. Chỉ khi học viên thấy ngõ ra rung mới giới thiệu hai ngưỡng.',
        title: 'Hysteresis chống nhiễu ở bộ so sánh',
        ref: 'Mục 7.5 và 8.3, Hình 8.2',
        kind: 'Khái niệm',
        task: 'Tăng biên độ nhiễu để thấy ngõ ra bộ so sánh rung quanh ngưỡng, rồi tăng độ rộng hysteresis cho đến khi ngõ ra chỉ đổi trạng thái đúng hai lần.',
        watch: [
          'Một ngưỡng duy nhất: nhiễu làm ngõ ra bật tắt nhiều lần.',
          'Hai ngưỡng: tín hiệu phải vượt hẳn ngưỡng trên mới bật, xuống hẳn dưới ngưỡng dưới mới tắt.',
          'Khoảng giữa hai ngưỡng giữ nguyên trạng thái trước đó.',
        ],
        qa: [
          ['Hysteresis cần rộng tối thiểu bao nhiêu so với nhiễu?', 'Rộng hơn biên độ đỉnh–đỉnh của nhiễu tại ngõ vào, cộng thêm dự phòng.'],
          ['Vì sao LM393 cần điện trở kéo lên?', 'Ngõ ra open-collector chỉ chủ động kéo xuống mức thấp; mức cao do điện trở kéo lên và nguồn kéo lên tạo ra.'],
        ],
      },
    ],
  },
  {
    slug: 'bai-8',
    short: 'Bài 8',
    title: 'Mạch cảm biến',
    hours: '6 giờ lý thuyết · 10 giờ thực hành · 2 giờ kiểm tra',
    goal: 'Ghép cảm biến, bộ so sánh có hysteresis và tầng công suất thành mạch điều khiển quạt, rồi tìm lỗi theo chuỗi đo.',
    sections: [
      {
        id: 'ntc-quat',
        teach: 'Chạy chu trình tự động và yêu cầu đọc nhiệt độ bật, tắt trên đồ thị. Nối với cách hiệu chỉnh hai điểm ở mục 8.5.',
        title: 'Điều khiển quạt theo nhiệt độ',
        ref: 'Mục 8.1–8.4, Hình 8.1 và 8.2, Ví dụ 1',
        kind: 'Mạch điện',
        task: 'Kéo nhiệt độ hoặc bấm “Chạy chu trình nóng, nguội”. Theo dõi điện trở NTC, điện áp Us và trạng thái quạt khi đi qua hai ngưỡng bật và tắt.',
        watch: [
          'NTC ở nhánh dưới: nóng lên thì điện trở giảm, Us giảm.',
          'Quạt bật ở ngưỡng trên và chỉ tắt khi nguội xuống ngưỡng dưới.',
          'Giữa hai ngưỡng, quạt giữ nguyên trạng thái trước đó.',
        ],
        qa: [
          ['Quạt bật và tắt ở hai giá trị Us nào?', 'Bật khi Us xuống khoảng 0,99 V (60 °C), tắt khi Us lên lại khoảng 1,51 V (45 °C), với NTC 10 kΩ, B = 3977 K và điện trở 10 kΩ ở nhánh trên.'],
          ['Đặt hai ngưỡng trùng nhau thì quạt hoạt động ra sao?', 'Mất hysteresis: nhiệt độ dao động quanh ngưỡng làm quạt bật tắt liên tục.'],
          ['Vì sao không đặt NTC ngay trước luồng gió của quạt?', 'Gió làm NTC nguội cục bộ, tạo vòng bật tắt nhanh không phản ánh nhiệt độ thật của vật cần làm mát.'],
        ],
      },
      {
        id: 'xu-ly-loi',
        teach: 'Dùng làm bài kiểm tra miệng theo nhóm: trước mỗi phép đo phải nêu lý do. Chấm theo quá trình, không chỉ theo kết quả.',
        title: 'Tìm lỗi theo chuỗi đo',
        ref: 'Mục 8.6–8.8; Phụ lục B',
        kind: 'Xử lý lỗi',
        task: 'Mạch quạt có một lỗi ẩn. Chọn trạng thái lạnh hoặc nóng, đo các điểm theo thứ tự hợp lý, so với cột “mạch tốt” rồi kết luận. Mỗi lần bấm “Mạch lỗi khác” là một lỗi mới.',
        watch: [
          'Đo theo chuỗi: nguồn → Us → Vref → GATE → quạt.',
          'Khối đầu tiên có số đo khác mạch tốt là nơi cần xem xét.',
          'Phải đo ở cả hai trạng thái lạnh và nóng mới phân biệt được một số lỗi.',
        ],
        qa: [
          ['Quạt không chạy khi nóng, GATE vẫn ở 0 V nhưng Us và Vref đều đúng. Nghi ngờ gì?', 'Ngõ ra bộ so sánh không lên được mức cao, ví dụ thiếu điện trở kéo lên.'],
          ['Vì sao không nên thay linh kiện ngay khi thấy mạch không chạy?', 'Thay ngẫu nhiên không cho biết nguyên nhân và có thể thêm lỗi mới. Dùng số đo để khoanh vùng, thay đổi một yếu tố mỗi lần, rồi đo lại toàn bộ.'],
        ],
      },
    ],
  },
];

export const dtKinds: Record<DtSection['kind'], string> = {
  'Mạch điện': 'mach',
  'Kỹ năng đọc': 'doc',
  'Kỹ năng đo': 'do',
  'Khái niệm': 'kn',
  'Tính toán': 'tinh',
  'Xử lý lỗi': 'loi',
};
export const dtTotal = dtLessons.reduce((n, l) => n + l.sections.length, 0);
