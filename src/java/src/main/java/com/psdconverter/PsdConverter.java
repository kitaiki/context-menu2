package com.psdconverter;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * PSD 파일을 PNG 포맷으로 변환하는 클래스
 */
public class PsdConverter {
    private static final Logger logger = LoggerFactory.getLogger(PsdConverter.class);
    private static final String PNG_FORMAT = "png";

    /**
     * PSD 파일을 PNG 파일로 변환
     *
     * @param psdFile 변환할 PSD 파일
     * @param outputFile 출력할 PNG 파일
     * @return 변환 성공 여부
     */
    public boolean convertPsdToPng(File psdFile, File outputFile) {
        if (psdFile == null || !psdFile.exists()) {
            logger.error("PSD 파일이 존재하지 않습니다: {}", psdFile);
            return false;
        }

        if (!psdFile.getName().toLowerCase().endsWith(".psd")) {
            logger.error("PSD 파일이 아닙니다: {}", psdFile.getName());
            return false;
        }

        try {
            logger.info("PSD 파일 변환 시작: {}", psdFile.getName());

            // PSD 파일 읽기 (TwelveMonkeys ImageIO가 자동으로 처리)
            BufferedImage image = ImageIO.read(psdFile);

            if (image == null) {
                logger.error("PSD 파일을 읽을 수 없습니다: {}", psdFile.getName());
                return false;
            }

            logger.info("이미지 크기: {}x{}", image.getWidth(), image.getHeight());

            // 출력 디렉토리가 없으면 생성
            File outputDir = outputFile.getParentFile();
            if (outputDir != null && !outputDir.exists()) {
                boolean created = outputDir.mkdirs();
                if (created) {
                    logger.info("출력 디렉토리 생성: {}", outputDir.getAbsolutePath());
                }
            }

            // PNG 파일로 저장
            boolean written = ImageIO.write(image, PNG_FORMAT, outputFile);

            if (written) {
                logger.info("PNG 파일 생성 완료: {}", outputFile.getAbsolutePath());
                return true;
            } else {
                logger.error("PNG 파일 저장 실패: {}", outputFile.getAbsolutePath());
                return false;
            }

        } catch (IOException e) {
            logger.error("PSD 변환 중 오류 발생: {}", e.getMessage(), e);
            return false;
        } catch (Exception e) {
            logger.error("예상치 못한 오류 발생: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * PSD 파일을 PNG 파일로 변환 (파일 경로로)
     *
     * @param psdFilePath 변환할 PSD 파일 경로
     * @param outputFilePath 출력할 PNG 파일 경로
     * @return 변환 성공 여부
     */
    public boolean convertPsdToPng(String psdFilePath, String outputFilePath) {
        File psdFile = new File(psdFilePath);
        File outputFile = new File(outputFilePath);
        return convertPsdToPng(psdFile, outputFile);
    }

    /**
     * PSD 파일명을 PNG 파일명으로 변환
     *
     * @param psdFileName PSD 파일명
     * @return PNG 파일명
     */
    public static String getPngFileName(String psdFileName) {
        if (psdFileName == null || psdFileName.isEmpty()) {
            return "output.png";
        }

        // .psd 확장자를 .png로 변경
        if (psdFileName.toLowerCase().endsWith(".psd")) {
            return psdFileName.substring(0, psdFileName.length() - 4) + ".png";
        }

        return psdFileName + ".png";
    }

    /**
     * PSD 파일의 유효성 검사
     *
     * @param file 검사할 파일
     * @return PSD 파일 여부
     */
    public static boolean isPsdFile(File file) {
        if (file == null || !file.exists() || !file.isFile()) {
            return false;
        }
        return file.getName().toLowerCase().endsWith(".psd");
    }
}
