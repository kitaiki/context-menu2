package com.psdconverter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.List;
import java.util.Scanner;

/**
 * PSD to PNG 변환기 메인 애플리케이션
 */
public class Main {
    private static final Logger logger = LoggerFactory.getLogger(Main.class);
    private static final String DEFAULT_UPLOAD_FOLDER = "/Users/kitaiki/Documents/workspace/ol-test/upload";

    public static void main(String[] args) {
        logger.info("=== PSD to PNG 변환기 시작 ===");

        // FileManager와 PsdConverter 초기화
        FileManager fileManager = new FileManager(DEFAULT_UPLOAD_FOLDER);
        PsdConverter psdConverter = new PsdConverter();

        // 사용자에게 모드 선택 제공
        Scanner scanner = new Scanner(System.in);
        System.out.println("\n실행 모드를 선택하세요:");
        System.out.println("1. 기존 PSD 파일 일괄 변환");
        System.out.println("2. 폴더 실시간 모니터링 (새로운 PSD 파일 자동 변환)");
        System.out.println("3. 특정 파일 변환");
        System.out.print("선택 (1-3): ");

        String choice = scanner.nextLine().trim();

        switch (choice) {
            case "1":
                batchConversion(scanner, fileManager, psdConverter);
                break;
            case "2":
                monitoringMode(scanner, fileManager, psdConverter);
                break;
            case "3":
                singleFileConversion(scanner, fileManager, psdConverter);
                break;
            default:
                logger.error("잘못된 선택입니다.");
                System.out.println("1, 2, 또는 3을 입력하세요.");
        }

        scanner.close();
        logger.info("=== 프로그램 종료 ===");
    }

    /**
     * 모드 1: 기존 PSD 파일 일괄 변환
     */
    private static void batchConversion(Scanner scanner, FileManager fileManager, PsdConverter psdConverter) {
        System.out.print("\nPSD 파일이 있는 폴더 경로를 입력하세요: ");
        String inputFolder = scanner.nextLine().trim();

        if (inputFolder.isEmpty()) {
            logger.error("폴더 경로가 입력되지 않았습니다.");
            return;
        }

        logger.info("폴더에서 PSD 파일 검색 중: {}", inputFolder);
        List<File> psdFiles = fileManager.findPsdFiles(inputFolder);

        if (psdFiles.isEmpty()) {
            logger.warn("PSD 파일을 찾을 수 없습니다.");
            return;
        }

        int successCount = 0;
        int failCount = 0;

        for (File psdFile : psdFiles) {
            logger.info("\n처리 중: {}", psdFile.getName());

            // 1. 원본 PSD 파일을 upload 폴더로 복사
            File copiedPsd = fileManager.copyPsdToUploadFolder(psdFile);

            if (copiedPsd == null) {
                logger.error("PSD 파일 복사 실패: {}", psdFile.getName());
                failCount++;
                continue;
            }

            // 2. PNG로 변환
            String pngOutputPath = fileManager.getPngOutputPath(psdFile.getName());
            boolean success = psdConverter.convertPsdToPng(psdFile, new File(pngOutputPath));

            if (success) {
                successCount++;
                logger.info("✓ 변환 성공: {}", psdFile.getName());
            } else {
                failCount++;
                logger.error("✗ 변환 실패: {}", psdFile.getName());
            }
        }

        logger.info("\n=== 변환 결과 ===");
        logger.info("총 파일 수: {}", psdFiles.size());
        logger.info("성공: {}", successCount);
        logger.info("실패: {}", failCount);
        logger.info("저장 위치: {}", fileManager.getUploadFolderPath());
    }

    /**
     * 모드 2: 폴더 실시간 모니터링
     */
    private static void monitoringMode(Scanner scanner, FileManager fileManager, PsdConverter psdConverter) {
        System.out.print("\n모니터링할 폴더 경로를 입력하세요: ");
        String watchFolder = scanner.nextLine().trim();

        if (watchFolder.isEmpty()) {
            logger.error("폴더 경로가 입력되지 않았습니다.");
            return;
        }

        File folder = new File(watchFolder);
        if (!folder.exists() || !folder.isDirectory()) {
            logger.error("유효하지 않은 폴더 경로입니다: {}", watchFolder);
            return;
        }

        logger.info("폴더 모니터링 시작: {}", watchFolder);
        logger.info("새로운 PSD 파일이 추가되면 자동으로 변환됩니다.");

        fileManager.watchFolder(watchFolder, psdFile -> {
            logger.info("\n새로운 PSD 파일 감지: {}", psdFile.getName());

            // 파일이 완전히 복사될 때까지 대기
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            // 1. 원본 PSD 파일을 upload 폴더로 복사
            File copiedPsd = fileManager.copyPsdToUploadFolder(psdFile);

            if (copiedPsd == null) {
                logger.error("PSD 파일 복사 실패: {}", psdFile.getName());
                return;
            }

            // 2. PNG로 변환
            String pngOutputPath = fileManager.getPngOutputPath(psdFile.getName());
            boolean success = psdConverter.convertPsdToPng(psdFile, new File(pngOutputPath));

            if (success) {
                logger.info("✓ 자동 변환 성공: {}", psdFile.getName());
            } else {
                logger.error("✗ 자동 변환 실패: {}", psdFile.getName());
            }
        });
    }

    /**
     * 모드 3: 특정 파일 변환
     */
    private static void singleFileConversion(Scanner scanner, FileManager fileManager, PsdConverter psdConverter) {
        System.out.print("\n변환할 PSD 파일의 전체 경로를 입력하세요: ");
        String filePath = scanner.nextLine().trim();

        if (filePath.isEmpty()) {
            logger.error("파일 경로가 입력되지 않았습니다.");
            return;
        }

        File psdFile = new File(filePath);

        if (!psdFile.exists()) {
            logger.error("파일이 존재하지 않습니다: {}", filePath);
            return;
        }

        if (!PsdConverter.isPsdFile(psdFile)) {
            logger.error("PSD 파일이 아닙니다: {}", psdFile.getName());
            return;
        }

        logger.info("파일 변환 시작: {}", psdFile.getName());

        // 1. 원본 PSD 파일을 upload 폴더로 복사
        File copiedPsd = fileManager.copyPsdToUploadFolder(psdFile);

        if (copiedPsd == null) {
            logger.error("PSD 파일 복사 실패: {}", psdFile.getName());
            return;
        }

        // 2. PNG로 변환
        String pngOutputPath = fileManager.getPngOutputPath(psdFile.getName());
        boolean success = psdConverter.convertPsdToPng(psdFile, new File(pngOutputPath));

        if (success) {
            logger.info("✓ 변환 성공!");
            logger.info("PSD 파일: {}", copiedPsd.getAbsolutePath());
            logger.info("PNG 파일: {}", pngOutputPath);
        } else {
            logger.error("✗ 변환 실패: {}", psdFile.getName());
        }
    }
}
