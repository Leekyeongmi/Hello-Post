console.log('✔✔ postsController called!');
const { isAuthorized } = require('../utils/token');
const { Post, Message } = require('../models');

module.exports = {
  // 메시지 작성
  // posts/message
  write: (req, res) => {
    // 👀 지금 코드 상으로 sendButton 눌렀을 때 클라에서 오는 name, message가 없음
    // 메시지 작성은 posts/:uid 뒤에 오는 uid를 가져와야 함
    const { owner_id, writer, message } = req.body;

    // owner_id(uid)로 post_id 찾기
    Post.findOne({
      where: { user_id: owner_id },
    })
      .then(thePost => {
        const post_id = thePost.id;

        Message.create({
          post_id,
          content: message,
          writer,
        });
        res.status(201).json({ message: '메시지 작성 완료', data: null });
      })
      .catch(err => {
        console.log('메시지 작성 실패', err);
        return res
          .status(500)
          .json({ message: '메시지 작성 실패', data: null });
      });
  },

  // 메시지 삭제
  // delete: (req, res) => {},

  // 롤링페이퍼 조회
  // posts/:uid
  read: async (req, res) => {
    const user_id = req.params.uid;
    // console.log('😃req.params', req.params); // ✔uid로 넘어오는 것 확인

    // 1) 로그인 안 한 방문자
    const token = isAuthorized(req);

    if (!token) {
      try {
        const thePost = await Post.findOne({ where: { user_id } });
        const { id, title } = thePost;
      } catch (e) {
        console.log('user_id로 post 조회 실패', e);
      }
      try {
        const theMessage = Message.findAndCountAll({ where: { post_id: id } });
        const { count, rows } = theMessage;
      } catch (msgFindError) {
        console.log('post_id로 message 조회 실패', msgFindError);
      } finally {
        return res
          .status(500)
          .json({ message: '해당 유저의 롤링페이퍼 조회 실패', data: null });
      }

      res.status(200).json({
        message: 'ok',
        data: {
          title,
          total_message: count,
          // rows는 객체 배열: [{}, {}, {}]
          messages: rows.map(row => {
            const { id, content, writer, created_at } = row;

            return { id, content, writer, created_at };
          }),
        },
      });
    }
    // 2) 로그인 된 유저 -> 사이드바 클릭 시 유저 정보까지 보여야 함
    else {
      const loginUser = isAuthorized(req);

      const { email, nickname, available, post_id } = loginUser;

      Post.findOne({ where: { user_id } }).then(thePost => {
        const { id, title } = thePost;

        Message.findAndCountAll({ where: { post_id: id } }).then(theMessage => {
          const { count, rows } = theMessage;

          res.status(200).json({
            message: 'ok',
            data: {
              title,
              total_message: count,
              // rows는 객체 배열: [{}, {}, {}]
              messages: rows.map(row => {
                const { id, content, writer, created_at } = row;

                return { id, content, writer, created_at };
              }),
              uid: id,
              email,
              nickname,
            },
          });
        });
      });
    }
  },

  // 개별 메시지 클릭 시 전체 메시지 목록 조회
  // readAll: (req, res) => {},
};
