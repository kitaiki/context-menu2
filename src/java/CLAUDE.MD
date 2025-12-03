# 프로젝트 개요
이프로젝트는 java 기반으로 PSD파일을 입력받아 png 파일로 만들고 내용을 DB에 등록하는 애플리케이션입니다.

## 개발환경
- 언어: JAVA 최신버전
- 플랫폼: 윈도우, 리눅스
- DB: mssql

## 기능
- 폴더에서 PSD파일을 읽어서 png파일로 변환
- psd파일과 생성된 png파일을 /Users/kitaiki/Documents/workspace/ol-test/upload 폴더에 저장
- db는 현재 없기때문에 실행하는 소스는 주석으로 막아야함
- DB저장 정보: psd파일명, png파일명, 등록자, 등록일시