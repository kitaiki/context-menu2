import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * PNG 이미지 파일을 ZIP으로 압축하여 다운로드하는 애플리케이션
 *
 * 기능:
 * - upload 폴더의 PNG 파일들을 검색
 * - 다중 PNG 파일을 ZIP으로 압축
 * - 생성된 ZIP 파일 저장
 *
 * @author CLAUDE
 * @version 1.0
 */
public class PngToZipDownloader {

    // 상수 정의
    private static final String UPLOAD_FOLDER = "/Users/kitaiki/Documents/workspace/ol-test/upload";
    private static final String ZIP_OUTPUT_FOLDER = "/Users/kitaiki/Documents/workspace/ol-test/download";
    private static final String PNG_EXTENSION = ".png";
    private static final int BUFFER_SIZE = 8192;

    /**
     * 메인 실행 메서드
     */
    public static void main(String[] args) {
        PngToZipDownloader downloader = new PngToZipDownloader();

        try {
            System.out.println("=== PNG to ZIP 다운로더 시작 ===");
            System.out.println("업로드 폴더: " + UPLOAD_FOLDER);

            // PNG 파일 검색
            List<Path> pngFiles = downloader.findPngFiles();

            if (pngFiles.isEmpty()) {
                System.out.println("⚠️  PNG 파일을 찾을 수 없습니다.");
                return;
            }

            System.out.println("✅ 발견된 PNG 파일: " + pngFiles.size() + "개");
            pngFiles.forEach(file -> System.out.println("  - " + file.getFileName()));

            // ZIP 파일 생성
            Path zipFile = downloader.createZipFile(pngFiles);

            System.out.println("✅ ZIP 파일 생성 완료: " + zipFile.toAbsolutePath());
            System.out.println("파일 크기: " + formatFileSize(Files.size(zipFile)));
            System.out.println("=== 처리 완료 ===");

        } catch (IOException e) {
            System.err.println("❌ 오류 발생: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * upload 폴더에서 PNG 파일 검색
     *
     * @return PNG 파일 경로 리스트
     * @throws IOException 파일 시스템 접근 오류
     */
    private List<Path> findPngFiles() throws IOException {
        Path uploadPath = Paths.get(UPLOAD_FOLDER);

        // 폴더 존재 확인
        if (!Files.exists(uploadPath)) {
            System.out.println("⚠️  업로드 폴더가 존재하지 않습니다. 폴더 생성 중...");
            Files.createDirectories(uploadPath);
            return Collections.emptyList();
        }

        // PNG 파일 필터링 및 수집
        try (var stream = Files.walk(uploadPath, 1)) {
            return stream
                .filter(Files::isRegularFile)
                .filter(path -> path.toString().toLowerCase().endsWith(PNG_EXTENSION))
                .sorted()
                .collect(Collectors.toList());
        }
    }

    /**
     * PNG 파일들을 ZIP으로 압축
     *
     * @param pngFiles 압축할 PNG 파일 리스트
     * @return 생성된 ZIP 파일 경로
     * @throws IOException ZIP 생성 오류
     */
    private Path createZipFile(List<Path> pngFiles) throws IOException {
        // 다운로드 폴더 생성
        Path downloadPath = Paths.get(ZIP_OUTPUT_FOLDER);
        if (!Files.exists(downloadPath)) {
            Files.createDirectories(downloadPath);
        }

        // 타임스탬프 기반 ZIP 파일명 생성
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String zipFileName = "png_images_" + timestamp + ".zip";
        Path zipFilePath = downloadPath.resolve(zipFileName);

        // ZIP 파일 생성
        try (ZipOutputStream zos = new ZipOutputStream(
                new BufferedOutputStream(Files.newOutputStream(zipFilePath)))) {

            // 압축 레벨 설정 (0-9, 기본값 6)
            zos.setLevel(Deflater.DEFAULT_COMPRESSION);

            byte[] buffer = new byte[BUFFER_SIZE];

            for (Path pngFile : pngFiles) {
                // ZIP 엔트리 생성
                ZipEntry entry = new ZipEntry(pngFile.getFileName().toString());
                entry.setTime(Files.getLastModifiedTime(pngFile).toMillis());
                zos.putNextEntry(entry);

                // 파일 내용 복사
                try (InputStream fis = new BufferedInputStream(Files.newInputStream(pngFile))) {
                    int bytesRead;
                    while ((bytesRead = fis.read(buffer)) != -1) {
                        zos.write(buffer, 0, bytesRead);
                    }
                }

                zos.closeEntry();
                System.out.println("  압축 완료: " + pngFile.getFileName());
            }
        }

        return zipFilePath;
    }

    /**
     * 파일 크기를 읽기 쉬운 형식으로 변환
     *
     * @param size 바이트 단위 파일 크기
     * @return 포맷팅된 파일 크기 문자열
     */
    private static String formatFileSize(long size) {
        if (size < 1024) return size + " B";
        int exp = (int) (Math.log(size) / Math.log(1024));
        char unit = "KMGTPE".charAt(exp - 1);
        return String.format("%.2f %cB", size / Math.pow(1024, exp), unit);
    }
}
