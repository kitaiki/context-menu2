# OpenLayers React Map

React + TypeScript + OpenLayers를 사용한 대화형 OSM 지도 애플리케이션

## 🚀 기능

- **OpenLayers 8** 기반 대화형 지도
- **OpenStreetMap (OSM)** 타일 서비스
- **TypeScript** 타입 안전성
- **Vite** 빠른 개발 서버 및 빌드
- **반응형 디자인** (모바일 최적화)
- **실시간 위치 추적** (Geolocation API)
- **한국 주요 도시** 빠른 이동
- **클릭 위치 좌표** 표시 및 기록
- **에러 바운더리** 및 로딩 상태 관리

## 📦 기술 스택

- **Frontend**: React 18, TypeScript
- **지도**: OpenLayers 8.2.0
- **빌드 도구**: Vite 5.0
- **스타일링**: CSS3, Flexbox, Grid
- **지도 데이터**: OpenStreetMap

## 🛠️ 설치 및 실행

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 3. 프로덕션 빌드
```bash
npm run build
```

### 4. 빌드 미리보기
```bash
npm run preview
```

## 🗺️ 사용 방법

### 기본 조작
- **지도 이동**: 마우스 드래그
- **줌 인/아웃**: 마우스 휠 또는 버튼 클릭
- **위치 클릭**: 지도를 클릭하면 좌표 정보 표시

### 도시 이동
- 서울, 부산, 인천, 대구, 대전, 광주 버튼 클릭시 해당 위치로 자동 이동

### 현재 위치
- "현재 위치 찾기" 버튼으로 GPS 위치 표시 (위치 권한 필요)

### 위치 기록
- 클릭한 위치 최대 10개까지 기록 및 표시
- "기록 초기화" 버튼으로 기록 삭제

## 📱 반응형 지원

- **데스크톱**: 1200px+ 최적화
- **태블릿**: 768px-1199px 적응형 레이아웃
- **모바일**: 768px 미만 터치 최적화

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18+ 
- npm 9+

### IDE 추천 설정 (VS Code)
```json
{
  "typescript.preferences.useAliasesForRenames": false,
  "typescript.preferences.includePackageJsonAutoImports": "auto"
}
```

### 추천 VS Code 확장
- TypeScript Importer
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag

## 📂 프로젝트 구조

```
ol-test/
├── public/                 # 정적 파일
├── src/
│   ├── components/        
│   │   └── MapComponent.tsx # OpenLayers 지도 컴포넌트
│   ├── App.tsx            # 메인 앱 컴포넌트
│   ├── App.css           # 앱 스타일
│   ├── main.tsx          # React 진입점
│   └── index.css         # 글로벌 스타일
├── index.html            # HTML 템플릿
├── package.json          # 의존성 및 스크립트
├── tsconfig.json         # TypeScript 설정
├── vite.config.ts        # Vite 빌드 설정
└── README.md
```

## 🌟 주요 컴포넌트

### MapComponent.tsx
- OpenLayers 지도 렌더링
- OSM 타일 레이어 설정
- 이벤트 핸들링 (클릭, 줌 등)
- 지도 조작 메서드 제공

### App.tsx  
- 전체 애플리케이션 레이아웃
- 상태 관리 (클릭 위치 기록 등)
- Geolocation API 연동
- 에러 처리 및 로딩 상태

## 🔒 보안 고려사항

- **HTTPS 필수**: Geolocation API 사용을 위해 HTTPS 환경 권장
- **Content Security Policy**: 외부 타일 서버 접근 허용 필요
- **API 키 관리**: 상용 타일 서비스 사용시 환경변수 사용

## 🚀 배포

### Netlify
```bash
npm run build
# dist/ 폴더를 Netlify에 드래그 앤 드롭
```

### Vercel
```bash
npm run build
vercel --prod
```

### GitHub Pages
```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d dist
```

## 🐛 문제 해결

### 지도가 로드되지 않는 경우
1. 네트워크 연결 확인
2. 브라우저 콘솔 에러 메시지 확인
3. OpenStreetMap 서버 상태 확인

### 현재 위치를 찾을 수 없는 경우
1. HTTPS 프로토콜 사용 확인
2. 브라우저 위치 권한 허용
3. GPS/위치 서비스 활성화 확인

### 빌드 오류 발생시
```bash
# 캐시 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

## 📄 라이선스

MIT License

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해 주세요.

---

**Happy Mapping! 🗺️**