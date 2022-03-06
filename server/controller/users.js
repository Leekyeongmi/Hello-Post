console.log('✔ usersController called!');
// usersController
require('dotenv').config();
const {
  generateToken,
  verifyToken,
  setTokenCookie,
} = require('./tokenFunc.js');
const {
  findUser,
  createUser,
  updateUserInfo,
  deleteAccount,
} = require('../data/usersData');
const user = require('../models/user.js');

module.exports = {
  // 회원가입
  signup: (req, res) => {
    res.send();
  },

  // 로그인
  signin: (req, res) => {
    console.log('✔ siginin() called!');
    // 1) 클라이언트로 부터 { email, password }와 함께 로그인 요청이 옴 => 가입된 회원인지 확인 필요
    // 2) 데이터 추출
    const { email, password } = req.body;
    // 3) 해당 로그인 정보로 db에서 유저 찾기 => userData.findUser(email, password) 사용 예정
    // 없다면, 로그인 정보가 틀렸거나, 회원이 아님 => 에러
    const user = findUser(email, password);
    console.log('=================', user);

    if (!user) {
      return res.status(401).json({ data: null, message: '회원 정보 없음' });
    } else {
      // 있다면, 해당 유저의 정보로 accessToken 생성
      const { id, email, nickname, available, createdAt, updatedAt } =
        user.dataValues;
      const token = generateToken({ id, email }, process.env.ACCESS_SECRET);
      // 4) 생성된 access _token을 응답의 쿠키에 심기
      res
        .status(200)
        .cookie('accessToken', token, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        })
        .json({
          // 5) 쿠키: access_token, 옵션 설정, 바디: { 유저 데이터 } => 'posts/본인아이디'로 리디렉션
          message: '로그인 성공',
          data: { id, email, nickname, available, createdAt, updatedAt },
        });
    }
  },

  // 로그아웃
  signout: (req, res) => {
    res.send();
  },

  // 회원정보 조회
  read: (req, res) => {
    res.send();
  },

  // 회원정보 수정
  update: (req, res) => {
    res.send();
  },

  // 회원탈퇴
  delete: (req, res) => {
    res.send();
  },
};
