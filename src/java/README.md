# PSD to PNG 변환기

PSD(Photoshop Document) 파일을 PNG 포맷으로 변환하는 Java 애플리케이션입니다.

## 프로젝트 개요

이 프로젝트는 Java 기반으로 PSD 파일을 입력받아 PNG 파일로 변환하고, 원본 PSD와 변환된 PNG 파일을 지정된 폴더에 저장하는 애플리케이션입니다.

## 주요 기능

- ✅ **일괄 변환**: 폴더 내의 모든 PSD 파일을 한 번에 PNG로 변환
- ✅ **실시간 모니터링**: 폴더를 감시하여 새로운 PSD 파일이 추가되면 자동 변환
- ✅ **단일 파일 변환**: 특정 PSD 파일 하나만 변환
- ✅ **자동 파일 관리**: 원본 PSD와 변환된 PNG를 upload 폴더에 자동 저장

## 기술 스택

- **언어**: Java 17+
- **빌드 도구**: Maven 3.8+
- **PSD 처리 라이브러리**: TwelveMonkeys ImageIO 3.10.1
- **로깅**: SLF4J 2.0.9

## 프로젝트 구조

```
src/java/
├── pom.xml                                  # Maven 설정
├── src/
│   └── main/
│       └── java/
│           └── com/psdconverter/
│               ├── Main.java                # 메인 애플리케이션
│               ├── PsdConverter.java        # PSD → PNG 변환 로직
│               └── FileManager.java         # 파일 관리 및 모니터링
└── README.md
```

## 설치 및 실행

### 1. 사전 요구사항

- Java 17 이상
- Maven 3.8 이상

### 2. 프로젝트 빌드

```bash
cd /Users/kitaiki/Documents/workspace/ol-test/src/java
mvn clean package
```

### 3. 실행

#### 방법 1: Maven으로 직접 실행
```bash
mvn exec:java -Dexec.mainClass="com.psdconverter.Main"
```

#### 방법 2: JAR 파일로 실행
```bash
java -jar target/psd-to-png-converter-1.0.0-jar-with-dependencies.jar
```

## 사용 방법

### 실행 모드 선택

프로그램 실행 시 3가지 모드 중 하나를 선택할 수 있습니다:

#### 1. 기존 PSD 파일 일괄 변환
- 지정된 폴더의 모든 PSD 파일을 한 번에 변환
- 사용 시나리오: 다수의 PSD 파일을 한꺼번에 처리할 때

```
실행 모드를 선택하세요:
1. 기존 PSD 파일 일괄 변환
선택 (1-3): 1

PSD 파일이 있는 폴더 경로를 입력하세요: /path/to/psd/files
```

#### 2. 폴더 실시간 모니터링
- 지정된 폴더를 감시하여 새로운 PSD 파일이 추가되면 자동으로 변환
- 사용 시나리오: 지속적으로 새로운 PSD 파일이 추가되는 환경

```
실행 모드를 선택하세요:
2. 폴더 실시간 모니터링 (새로운 PSD 파일 자동 변환)
선택 (1-3): 2

모니터링할 폴더 경로를 입력하세요: /path/to/watch/folder
```

종료: `Ctrl+C`

#### 3. 특정 파일 변환
- 하나의 PSD 파일만 선택하여 변환
- 사용 시나리오: 특정 파일만 빠르게 변환할 때

```
실행 모드를 선택하세요:
3. 특정 파일 변환
선택 (1-3): 3

변환할 PSD 파일의 전체 경로를 입력하세요: /path/to/file.psd
```

## 출력 위치

모든 변환된 파일은 다음 위치에 저장됩니다:

```
/Users/kitaiki/Documents/workspace/ol-test/upload/
├── original_file.psd    # 원본 PSD 파일
└── original_file.png    # 변환된 PNG 파일
```

## 로그 메시지

애플리케이션은 SLF4J를 사용하여 상세한 로그를 출력합니다:

- `INFO`: 일반 정보 (파일 발견, 변환 진행 상황)
- `WARN`: 경고 (폴더 미존재 등)
- `ERROR`: 오류 (변환 실패, 파일 복사 실패)

## 클래스 설명

### Main.java
- 애플리케이션 진입점
- 사용자 인터페이스 제공
- 3가지 실행 모드 관리

### PsdConverter.java
- PSD → PNG 변환 핵심 로직
- TwelveMonkeys ImageIO 라이브러리 활용
- 파일 유효성 검사 및 에러 처리

### FileManager.java
- 파일 및 폴더 관리
- PSD 파일 검색
- 폴더 실시간 모니터링
- 파일 복사 및 저장

## 라이브러리 정보

### TwelveMonkeys ImageIO
- **용도**: PSD 파일 읽기 및 변환
- **버전**: 3.10.1
- **라이선스**: BSD-style license (상업적 사용 가능)
- **특징**:
  - Java ImageIO 확장 플러그인
  - Adobe Photoshop 없이 PSD 파일 처리 가능
  - 다양한 PSD 버전 지원 (PSB 포함)

## 트러블슈팅

### 문제: "PSD 파일을 읽을 수 없습니다"
- **원인**: 손상된 PSD 파일 또는 지원되지 않는 버전
- **해결**: Adobe Photoshop에서 파일을 열어 재저장

### 문제: "Upload 폴더 생성 실패"
- **원인**: 디렉토리 쓰기 권한 부족
- **해결**: 폴더 권한 확인 또는 `sudo`로 실행

### 문제: "OutOfMemoryError"
- **원인**: 큰 PSD 파일 처리 시 메모리 부족
- **해결**: JVM 힙 메모리 증가
  ```bash
  java -Xmx2G -jar target/psd-to-png-converter-1.0.0-jar-with-dependencies.jar
  ```

## 개발 환경

- **OS**: Windows, Linux, macOS
- **IDE**: IntelliJ IDEA, Eclipse, VS Code
- **Java SDK**: OpenJDK 17+ 또는 Oracle JDK 17+

## 빌드 산출물

Maven 빌드 시 생성되는 파일:

- `psd-to-png-converter-1.0.0.jar`: 기본 JAR (의존성 미포함)
- `psd-to-png-converter-1.0.0-jar-with-dependencies.jar`: 실행 가능한 JAR (의존성 포함, 권장)

## 향후 계획

- [ ] DB 연동 (변환 이력 저장)
- [ ] GUI 인터페이스 추가
- [ ] 배치 크기 조절 옵션
- [ ] 다른 이미지 포맷 지원 (JPEG, WEBP)
- [ ] 레이어별 추출 기능

## 라이선스

이 프로젝트는 내부 사용 목적으로 개발되었습니다.

## 문의

프로젝트 관련 문의사항이 있으시면 개발팀에 연락해주세요.
