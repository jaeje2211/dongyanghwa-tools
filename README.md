# 동양화 도구 모음

아교포수 계산기 & 컬러배합 - 동양화 작업을 위한 디지털 도구

## 기능
- **아교포수 계산기**: 5가지 프리셋 + 나만의 비율 저장, 계절 보정, 교반수 가이드
- **컬러배합**: 헥스코드/이미지에서 동양화 물감 15종 기반 배합 레시피 생성
- **기록**: 계산·배합 기록 자동 저장
- **메모**: 작업 노트

## 배포 방법

### 1단계: GitHub에 올리기
```bash
git init
git add .
git commit -m "동양화 도구 모음 v1.0"
git remote add origin https://github.com/내아이디/dongyanghwa-tools.git
git push -u origin main
```

### 2단계: Vercel 배포
1. [vercel.com](https://vercel.com) 가입 (GitHub 계정으로)
2. "New Project" 클릭
3. GitHub 저장소 선택 (dongyanghwa-tools)
4. Framework: Vite 자동 감지됨
5. "Deploy" 클릭 → 끝!

배포 완료되면 `https://dongyanghwa-tools.vercel.app` 같은 URL이 생겨요.

### 3단계: 커스텀 도메인 (선택)
Vercel 대시보드 → Settings → Domains → 원하는 도메인 추가

## 로컬 개발
```bash
npm install
npm run dev
```

## PWA
홈 화면에 추가하면 앱처럼 사용할 수 있어요!
- 안드로이드: 크롬 → 메뉴 → "홈 화면에 추가"
- iOS: 사파리 → 공유 → "홈 화면에 추가"
