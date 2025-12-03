package com.psdconverter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

/**
 * 파일 관리 및 폴더 모니터링을 담당하는 클래스
 */
public class FileManager {
    private static final Logger logger = LoggerFactory.getLogger(FileManager.class);
    private final String uploadFolderPath;

    public FileManager(String uploadFolderPath) {
        this.uploadFolderPath = uploadFolderPath;
        ensureUploadFolderExists();
    }

    /**
     * upload 폴더가 없으면 생성
     */
    private void ensureUploadFolderExists() {
        File uploadFolder = new File(uploadFolderPath);
        if (!uploadFolder.exists()) {
            boolean created = uploadFolder.mkdirs();
            if (created) {
                logger.info("Upload 폴더 생성: {}", uploadFolderPath);
            } else {
                logger.warn("Upload 폴더 생성 실패: {}", uploadFolderPath);
            }
        } else {
            logger.info("Upload 폴더 확인: {}", uploadFolderPath);
        }
    }

    /**
     * 지정된 폴더에서 모든 PSD 파일 찾기
     *
     * @param folderPath 검색할 폴더 경로
     * @return PSD 파일 목록
     */
    public List<File> findPsdFiles(String folderPath) {
        List<File> psdFiles = new ArrayList<>();
        File folder = new File(folderPath);

        if (!folder.exists() || !folder.isDirectory()) {
            logger.warn("폴더가 존재하지 않거나 디렉토리가 아닙니다: {}", folderPath);
            return psdFiles;
        }

        File[] files = folder.listFiles((dir, name) ->
            name.toLowerCase().endsWith(".psd"));

        if (files != null) {
            for (File file : files) {
                psdFiles.add(file);
                logger.info("PSD 파일 발견: {}", file.getName());
            }
        }

        logger.info("총 {} 개의 PSD 파일 발견", psdFiles.size());
        return psdFiles;
    }

    /**
     * 원본 PSD 파일을 upload 폴더로 복사
     *
     * @param sourceFile 원본 파일
     * @return 복사된 파일
     */
    public File copyPsdToUploadFolder(File sourceFile) {
        try {
            File targetFile = new File(uploadFolderPath, sourceFile.getName());
            Path sourcePath = sourceFile.toPath();
            Path targetPath = targetFile.toPath();

            // 이미 존재하면 덮어쓰기
            Files.copy(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("PSD 파일 복사 완료: {} → {}",
                sourceFile.getName(), targetFile.getAbsolutePath());

            return targetFile;
        } catch (IOException e) {
            logger.error("PSD 파일 복사 실패: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * PNG 파일의 출력 경로 생성
     *
     * @param psdFileName PSD 파일명
     * @return PNG 파일 경로
     */
    public String getPngOutputPath(String psdFileName) {
        String pngFileName = PsdConverter.getPngFileName(psdFileName);
        return Paths.get(uploadFolderPath, pngFileName).toString();
    }

    /**
     * 파일 복사 (범용)
     *
     * @param source 원본 파일
     * @param target 대상 파일
     * @return 복사 성공 여부
     */
    public boolean copyFile(File source, File target) {
        try {
            Files.copy(source.toPath(), target.toPath(),
                StandardCopyOption.REPLACE_EXISTING);
            logger.info("파일 복사: {} → {}", source.getName(), target.getName());
            return true;
        } catch (IOException e) {
            logger.error("파일 복사 실패: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 폴더 모니터링 (실시간 감지)
     *
     * @param folderPath 모니터링할 폴더
     * @param callback PSD 파일 발견 시 실행할 콜백
     */
    public void watchFolder(String folderPath, FileWatchCallback callback) {
        try {
            Path path = Paths.get(folderPath);
            WatchService watchService = FileSystems.getDefault().newWatchService();
            path.register(watchService,
                StandardWatchEventKinds.ENTRY_CREATE,
                StandardWatchEventKinds.ENTRY_MODIFY);

            logger.info("폴더 모니터링 시작: {}", folderPath);
            logger.info("Ctrl+C로 종료하세요.");

            while (true) {
                WatchKey key = watchService.take();

                for (WatchEvent<?> event : key.pollEvents()) {
                    WatchEvent.Kind<?> kind = event.kind();

                    if (kind == StandardWatchEventKinds.OVERFLOW) {
                        continue;
                    }

                    @SuppressWarnings("unchecked")
                    WatchEvent<Path> ev = (WatchEvent<Path>) event;
                    Path filename = ev.context();
                    File file = path.resolve(filename).toFile();

                    if (PsdConverter.isPsdFile(file)) {
                        logger.info("새로운 PSD 파일 감지: {}", file.getName());
                        callback.onPsdFileDetected(file);
                    }
                }

                boolean valid = key.reset();
                if (!valid) {
                    break;
                }
            }

        } catch (IOException | InterruptedException e) {
            logger.error("폴더 모니터링 오류: {}", e.getMessage(), e);
            Thread.currentThread().interrupt();
        }
    }

    /**
     * PSD 파일 감지 시 실행할 콜백 인터페이스
     */
    @FunctionalInterface
    public interface FileWatchCallback {
        void onPsdFileDetected(File psdFile);
    }

    public String getUploadFolderPath() {
        return uploadFolderPath;
    }
}
