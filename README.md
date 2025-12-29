# Oracle Project [ROOT]
Creating Customised Route for Foreign Tourists Visiting South Korea

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## 주요 기능

- 🗺️ **관광지 검색**: Kakao Map API를 사용한 장소 검색
- 📍 **GPS 위치**: 현재 위치 자동 감지
- 🚶 **환경 친화적 경로**: 계절별 가중치를 고려한 최적 경로 추천
- 🗺️ **경로 시각화**: 지도에 추천 경로와 최단 경로 표시

## 환경 설정

### Kakao Map API 키 설정 (관광지 검색을 위해 필요)

1. [Kakao Developers](https://developers.kakao.com)에서 애플리케이션을 등록합니다
2. REST API 키를 발급받습니다
3. `frontend/.env` 파일을 생성하고 다음 내용을 추가합니다:

```bash
REACT_APP_KAKAO_REST_API_KEY=your_kakao_api_key_here
```

**참고**: API 키가 없어도 프로젝트는 실행되지만, 관광지 검색 기능은 사용할 수 없습니다.

## 서버 실행 방법

### 전체 서버 실행 (백엔드 + 프론트엔드)

프로젝트 루트에서 다음 명령어를 실행하세요:

```bash
./start.sh
```

이 스크립트는 백엔드와 프론트엔드를 모두 실행합니다:
- 백엔드: http://localhost:8000
- 프론트엔드: http://localhost:3000
- API 문서: http://localhost:8000/docs

### 개별 서버 실행

#### 백엔드만 실행

```bash
./start-backend.sh
```

또는 수동으로:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 프론트엔드만 실행

```bash
./start-frontend.sh
```

또는 수동으로:

```bash
cd frontend
npm install
npm start
```

### 서버 종료 방법

#### 스크립트로 종료 (권장)

```bash
./stop.sh
```

이 스크립트는 백엔드와 프론트엔드 서버를 모두 종료합니다.

#### 수동으로 종료

**백엔드만 종료:**
```bash
pkill -f "uvicorn main:app"
```

**프론트엔드만 종료:**
```bash
pkill -f "react-scripts start"
```

**모든 서버 종료:**
```bash
pkill -f "uvicorn main:app"
pkill -f "react-scripts start"
```

**포트로 확인 및 종료:**
```bash
# 실행 중인 서버 확인
lsof -i :8000 -i :3000

# 특정 포트의 프로세스 종료
lsof -ti :8000 | xargs kill -9  # 백엔드 (포트 8000)
lsof -ti :3000 | xargs kill -9  # 프론트엔드 (포트 3000)
```

### 시스템 요구사항

- Python 3.8 이상
- Node.js 14 이상 및 npm
- macOS/Linux (Windows에서는 스크립트 경로 조정 필요)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
