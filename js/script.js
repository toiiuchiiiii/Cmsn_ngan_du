/* ============================================================
   MindWell — Main Application Script
   ============================================================ */

(function () {
  'use strict';

  var API_BASE = '/api';

  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------
  var state = {
    token: localStorage.getItem('mw_token') || null,
    user: null,
    currentContact: null,
    testStep: 0,
    testAnswers: [],
    testQuestions: [
      'Ít hứng thú hoặc niềm vui khi làm mọi việc?',
      'Cảm thấy chán nản, trầm cảm hoặc tuyệt vọng?',
      'Cảm thấy lo lắng, bồn chồn hoặc căng thẳng?',
      'Cảm thấy mệt mỏi hoặc thiếu năng lượng?',
      'Khó đi vào giấc ngủ hoặc khó ngủ?'
    ],
    testOptions: [
      { label: 'Không bao giờ', value: 0 },
      { label: 'Vài ngày', value: 1 },
      { label: 'Hơn nửa số ngày', value: 2 },
      { label: 'Hầu như mỗi ngày', value: 3 }
    ]
  };

  // ----------------------------------------------------------
  // DOM refs
  // ----------------------------------------------------------
  var $ = function (id) { return document.getElementById(id); };

  var navbar = $('navbar');
  var navToggle = $('navToggle');
  var navLinks = $('navLinks');
  var navAuth = $('navAuth');
  var navUser = $('navUser');
  var navUserName = $('navUserName');
  var loginBtn = $('loginBtn');
  var registerBtn = $('registerBtn');
  var logoutBtn = $('logoutBtn');

  var authModal = $('authModal');
  var modalClose = $('modalClose');
  var modalTabs = document.querySelectorAll('.modal-tab');
  var loginForm = $('loginForm');
  var registerForm = $('registerForm');
  var loginEmail = $('loginEmail');
  var loginPassword = $('loginPassword');
  var loginError = $('loginError');
  var registerName = $('registerName');
  var registerEmail = $('registerEmail');
  var registerPassword = $('registerPassword');
  var registerError = $('registerError');

  var serviceCards = document.querySelectorAll('.service-card');
  var detailSections = document.querySelectorAll('.detail-section');

  var postsFeed = $('postsFeed');
  var postTitleInput = $('postTitleInput');
  var postContentInput = $('postContentInput');
  var postSubmitBtn = $('postSubmitBtn');
  var postsCreate = $('postsCreate');

  var testContainer = $('testContainer');
  var testIntro = $('testIntro');
  var testStartBtn = $('testStartBtn');
  var testQuiz = $('testQuiz');
  var testResult = $('testResult');
  var testHistory = $('testHistory');
  var testProgressBar = document.querySelector('.test-progress-bar');
  var testProgressText = $('testProgressText');
  var testQuestion = $('testQuestion');
  var testOptions = $('testOptions');
  var testPrevBtn = $('testPrevBtn');
  var testNextBtn = $('testNextBtn');
  var testResultIcon = $('testResultIcon');
  var testResultTitle = $('testResultTitle');
  var testResultDesc = $('testResultDesc');
  var testResultScore = $('testResultScore');
  var testRetakeBtn = $('testRetakeBtn');
  var testHistoryList = $('testHistoryList');

  var apptDate = $('apptDate');
  var apptBookBtn = $('apptBookBtn');
  var appointmentsFeed = $('appointmentsFeed');

  var chatMessages = $('chatMessages');
  var chatInput = $('chatInput');
  var sendBtn = $('sendBtn');
  var chatSearch = $('chatSearch');
  var onlineCount = $('onlineCount');
  var convBack = $('convBack');
  var chatContacts = $('chatContacts');
  var chatConversation = $('chatConversation');
  var contactsList = $('contactsList');
  var convName = $('convName');
  var convAvatar = $('convAvatar');
  var convStatus = $('convStatus');
  var convInfo = $('convInfo');

  // ----------------------------------------------------------
  // API helpers
  // ----------------------------------------------------------
  function api(path, options) {
    options = options || {};
    var headers = { 'Content-Type': 'application/json' };
    if (state.token) {
      headers['Authorization'] = 'Bearer ' + state.token;
    }
    return fetch(API_BASE + path, {
      method: options.method || 'GET',
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) { throw new Error(data.error || 'Yêu cầu thất bại'); }
        return data;
      });
    });
  }

  // ----------------------------------------------------------
  // Auth
  // ----------------------------------------------------------
  function setUser(user) {
    state.user = user;
    if (user) {
      navAuth.classList.add('hidden');
      navUser.classList.remove('hidden');
      navUserName.textContent = user.name;
      postsCreate.classList.remove('hidden');
    } else {
      navAuth.classList.remove('hidden');
      navUser.classList.add('hidden');
      postsCreate.classList.add('hidden');
    }
  }

  function loadUser() {
    if (!state.token) {
      setUser(null);
      return;
    }
    api('/users/me').then(function (data) {
      setUser(data.user);
    }).catch(function () {
      state.token = null;
      localStorage.removeItem('mw_token');
      setUser(null);
    });
  }

  function openModal(tab) {
    authModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (tab) {
      modalTabs.forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.modal-form').forEach(function (f) { f.classList.remove('active'); });
      document.querySelector('.modal-tab[data-tab="' + tab + '"]').classList.add('active');
      document.getElementById(tab + 'Form').classList.add('active');
    }
    loginError.textContent = '';
    registerError.textContent = '';
  }

  function closeModal() {
    authModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  loginBtn.addEventListener('click', function () { openModal('login'); });
  registerBtn.addEventListener('click', function () { openModal('register'); });
  modalClose.addEventListener('click', closeModal);
  authModal.addEventListener('click', function (e) {
    if (e.target === authModal) closeModal();
  });

  modalTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-tab');
      modalTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      document.querySelectorAll('.modal-form').forEach(function (f) { f.classList.remove('active'); });
      document.getElementById(target + 'Form').classList.add('active');
      loginError.textContent = '';
      registerError.textContent = '';
    });
  });

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    loginError.textContent = '';
    var btn = loginForm.querySelector('.modal-submit');
    btn.disabled = true;
    btn.textContent = 'Đang đăng nhập...';

    api('/users/login', {
      method: 'POST',
      body: { email: loginEmail.value, password: loginPassword.value }
    }).then(function (data) {
      state.token = data.token;
      localStorage.setItem('mw_token', data.token);
      setUser(data.user);
      closeModal();
      loginForm.reset();
      loadPosts();
      loadAppointments();
      loadTestHistory();
      loadConversations();
    }).catch(function (err) {
      loginError.textContent = err.message;
    }).finally(function () {
      btn.disabled = false;
      btn.textContent = 'Đăng nhập';
    });
  });

  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    registerError.textContent = '';
    var btn = registerForm.querySelector('.modal-submit');
    btn.disabled = true;
    btn.textContent = 'Đang tạo tài khoản...';

    api('/users/register', {
      method: 'POST',
      body: { name: registerName.value, email: registerEmail.value, password: registerPassword.value }
    }).then(function (data) {
      state.token = data.token;
      localStorage.setItem('mw_token', data.token);
      setUser(data.user);
      closeModal();
      registerForm.reset();
      loadPosts();
      loadAppointments();
      loadTestHistory();
      loadConversations();
    }).catch(function (err) {
      registerError.textContent = err.message;
    }).finally(function () {
      btn.disabled = false;
      btn.textContent = 'Đăng ký';
    });
  });

  logoutBtn.addEventListener('click', function () {
    state.token = null;
    state.user = null;
    localStorage.removeItem('mw_token');
    setUser(null);
    if (pollTimer) clearInterval(pollTimer);
    currentConvId = null;
    contactsList.innerHTML = '<div class="posts-empty" style="padding:20px;text-align:center;font-size:0.85rem">Đăng nhập để xem tin nhắn</div>';
    chatMessages.innerHTML = '<div class="posts-empty">Chọn một liên hệ để bắt đầu trò chuyện</div>';
    chatInput.disabled = true;
    chatInput.placeholder = 'Đăng nhập để trò chuyện';
    convName.textContent = 'Chọn liên hệ';
    convStatus.textContent = '';
    convAvatar.style.display = 'none';
    onlineCount.textContent = '0 liên hệ';
    loadPosts();
    loadAppointments();
  });

  // ----------------------------------------------------------
  // Nav toggle (mobile)
  // ----------------------------------------------------------
  navToggle.addEventListener('click', function () {
    navLinks.classList.toggle('open');
    var icon = navToggle.querySelector('i');
    icon.className = navLinks.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
  });

  navLinks.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.querySelector('i').className = 'fas fa-bars';
    });
  });

  // ----------------------------------------------------------
  // Navbar shadow on scroll
  // ----------------------------------------------------------
  window.addEventListener('scroll', function () {
    navbar.style.boxShadow = window.scrollY > 40 ? '0 1px 8px rgba(0,0,0,0.06)' : 'none';
  });

  // ----------------------------------------------------------
  // Smooth scroll + service cards
  // ----------------------------------------------------------
  function smoothScrollTo(targetId) {
    var target = document.getElementById(targetId);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  serviceCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var sectionId = card.getAttribute('data-section');
      if (sectionId) smoothScrollTo(sectionId);
    });
  });

  // ----------------------------------------------------------
  // Scroll reveal for detail sections
  // ----------------------------------------------------------
  function revealSections() {
    detailSections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) {
        section.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', revealSections);
  window.addEventListener('load', revealSections);

  // ----------------------------------------------------------
  // Posts
  // ----------------------------------------------------------
  function loadPosts() {
    postsFeed.innerHTML = '<div class="posts-loading">Đang tải bài viết...</div>';

    api('/posts').then(function (data) {
      if (!data.posts || data.posts.length === 0) {
        postsFeed.innerHTML = '<div class="posts-empty">Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!</div>';
        return;
      }
      postsFeed.innerHTML = '';
      data.posts.forEach(function (post) {
        var card = document.createElement('div');
        card.className = 'post-card';
        var date = new Date(post.created_at).toLocaleDateString('vi-VN', {
          month: 'short', day: 'numeric', year: 'numeric'
        });
        card.innerHTML =
          '<div class="post-card-header">' +
            '<div class="post-card-author">' +
              '<div class="post-card-author-icon"><i class="fas fa-user"></i></div>' +
              '<span class="post-card-author-name">' + escapeHtml(post.author_name) + '</span>' +
            '</div>' +
            '<span class="post-card-date">' + date + '</span>' +
          '</div>' +
          '<div class="post-card-title">' + escapeHtml(post.title) + '</div>' +
          '<div class="post-card-content">' + escapeHtml(post.content) + '</div>' +
          (state.user && state.user.id === post.author_id
            ? '<div class="post-card-actions"><button class="post-card-action delete" data-id="' + post.id + '"><i class="fas fa-trash"></i> Xóa</button></div>'
            : '');
        postsFeed.appendChild(card);
      });

      postsFeed.querySelectorAll('.post-card-action.delete').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-id');
          if (confirm('Xóa bài viết này?')) {
            api('/posts/' + id, { method: 'DELETE' }).then(function () {
              loadPosts();
            }).catch(function (err) {
              alert('Lỗi: ' + err.message);
            });
          }
        });
      });
    }).catch(function () {
      postsFeed.innerHTML = '<div class="posts-empty">Không thể tải bài viết. Hãy đảm bảo máy chủ đang chạy.</div>';
    });
  }

  postSubmitBtn.addEventListener('click', function () {
    if (!state.token) {
      openModal('login');
      return;
    }
    var title = postTitleInput.value.trim();
    var content = postContentInput.value.trim();
    if (!title || !content) {
      alert('Vui lòng điền cả tiêu đề và nội dung.');
      return;
    }
    postSubmitBtn.disabled = true;
    postSubmitBtn.textContent = 'Đang đăng...';

    api('/posts', {
      method: 'POST',
      body: { title: title, content: content }
    }).then(function () {
      postTitleInput.value = '';
      postContentInput.value = '';
      loadPosts();
    }).catch(function (err) {
      alert('Lỗi: ' + err.message);
    }).finally(function () {
      postSubmitBtn.disabled = false;
      postSubmitBtn.textContent = 'Đăng';
    });
  });

  // ----------------------------------------------------------
  // Mental Health Test
  // ----------------------------------------------------------
  function loadTestHistory() {
    if (!state.token) {
      testHistory.classList.add('hidden');
      return;
    }
    api('/tests').then(function (data) {
      if (data.tests && data.tests.length > 0) {
        testHistory.classList.remove('hidden');
        testHistoryList.innerHTML = '';
        data.tests.forEach(function (t) {
          var item = document.createElement('div');
          item.className = 'test-history-item';
          var d = new Date(t.created_at).toLocaleDateString('vi-VN');
          item.innerHTML = '<span>' + d + '</span><span>Điểm: ' + t.score + ' — ' + t.result + '</span>';
          testHistoryList.appendChild(item);
        });
      } else {
        testHistory.classList.add('hidden');
      }
    }).catch(function () {
      testHistory.classList.add('hidden');
    });
  }

  function saveTest(score, result) {
    if (!state.token) return;
    api('/tests', {
      method: 'POST',
      body: { score: score, result: result }
    }).then(function () {
      loadTestHistory();
    }).catch(function () {});
  }

  function showTestIntro() {
    testIntro.classList.remove('hidden');
    testQuiz.classList.add('hidden');
    testResult.classList.add('hidden');
  }

  testStartBtn.addEventListener('click', function () {
    state.testStep = 0;
    state.testAnswers = [];
    testIntro.classList.add('hidden');
    testQuiz.classList.remove('hidden');
    testResult.classList.add('hidden');
    renderTestQuestion();
  });

  function renderTestQuestion() {
    var q = state.testQuestions[state.testStep];
    testQuestion.textContent = q;

    testOptions.innerHTML = '';
    state.testOptions.forEach(function (opt, idx) {
      var btn = document.createElement('button');
      btn.className = 'test-option';
      btn.textContent = opt.label;
      if (state.testAnswers[state.testStep] === idx) {
        btn.classList.add('selected');
      }
      btn.addEventListener('click', function () {
        testOptions.querySelectorAll('.test-option').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        state.testAnswers[state.testStep] = idx;
      });
      testOptions.appendChild(btn);
    });

    var progress = ((state.testStep + 1) / state.testQuestions.length) * 100;
    testProgressBar.style.setProperty('--pct', progress + '%');
    testProgressBar.style.setProperty('width', progress + '%');
    testProgressText.textContent = (state.testStep + 1) + ' / ' + state.testQuestions.length;

    testPrevBtn.classList.toggle('hidden', state.testStep === 0);
    testNextBtn.textContent = state.testStep === state.testQuestions.length - 1 ? 'Xem kết quả' : 'Tiếp';
  }

  testNextBtn.addEventListener('click', function () {
    if (state.testAnswers[state.testStep] === undefined) {
      alert('Vui lòng chọn một câu trả lời.');
      return;
    }
    if (state.testStep < state.testQuestions.length - 1) {
      state.testStep++;
      renderTestQuestion();
    } else {
      showTestResult();
    }
  });

  testPrevBtn.addEventListener('click', function () {
    if (state.testStep > 0) {
      state.testStep--;
      renderTestQuestion();
    }
  });

  function showTestResult() {
    testQuiz.classList.add('hidden');
    testResult.classList.remove('hidden');

    var total = 0;
    state.testAnswers.forEach(function (a) { total += (a !== undefined ? state.testOptions[a].value : 0); });
    testResultScore.textContent = total;

    if (total <= 4) {
      testResultIcon.innerHTML = '<i class="fas fa-smile" style="color:#6B9C7B;"></i>';
      testResultTitle.textContent = 'Bạn đang ổn';
      testResultDesc.textContent = 'Kết quả cho thấy mức căng thẳng thấp. Hãy duy trì thói quen lành mạnh và giữ kết nối với mạng lưới hỗ trợ của bạn.';
    } else if (total <= 9) {
      testResultIcon.innerHTML = '<i class="fas fa-meh" style="color:#E8A87C;"></i>';
      testResultTitle.textContent = 'Có dấu hiệu nhẹ';
      testResultDesc.textContent = 'Bạn có thể đang gặp một chút căng thẳng. Hãy thử các bài tập chánh niệm hoặc nói chuyện với người hỗ trợ đồng trang lứa.';
    } else if (total <= 14) {
      testResultIcon.innerHTML = '<i class="fas fa-frown" style="color:#E57373;"></i>';
      testResultTitle.textContent = 'Mức độ trung bình';
      testResultDesc.textContent = 'Kết quả cho thấy bạn có thể đang gặp khó khăn. Chúng tôi khuyên bạn nên đặt lịch tư vấn hoặc liên hệ với đội hỗ trợ.';
    } else {
      testResultIcon.innerHTML = '<i class="fas fa-heart-broken" style="color:#D32F2F;"></i>';
      testResultTitle.textContent = 'Hãy tìm kiếm hỗ trợ';
      testResultDesc.textContent = 'Kết quả cho thấy bạn đang gặp căng thẳng đáng kể. Hãy liên hệ ngay với chuyên gia tư vấn hoặc gọi đường dây nóng khủng hoảng (555) 123-4567.';
    }

    saveTest(total, testResultTitle.textContent);
  }

  testRetakeBtn.addEventListener('click', showTestIntro);

  // ----------------------------------------------------------
  // Appointments
  // ----------------------------------------------------------
  function loadAppointments() {
    if (!state.token) {
      appointmentsFeed.innerHTML = '<div class="appointments-auth-required"><p>Đăng nhập để xem lịch hẹn.</p><button class="btn btn-primary btn-sm" id="apptLoginBtn">Đăng nhập</button></div>';
      var apptLoginBtn = document.getElementById('apptLoginBtn');
      if (apptLoginBtn) {
        apptLoginBtn.addEventListener('click', function () { openModal('login'); });
      }
      return;
    }

    api('/appointments').then(function (data) {
      if (!data.appointments || data.appointments.length === 0) {
        appointmentsFeed.innerHTML = '<p class="appointments-empty">Chưa có lịch hẹn nào. Đặt lịch đầu tiên ở trên.</p>';
        return;
      }
      appointmentsFeed.innerHTML = '';
      data.appointments.forEach(function (appt) {
        var card = document.createElement('div');
        card.className = 'appointment-card';
        var d = new Date(appt.date).toLocaleString('vi-VN', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
        });
        card.innerHTML =
          '<div class="appointment-card-date">' + d + '</div>' +
          '<span class="appointment-card-status ' + appt.status + '">' + translateStatus(appt.status) + '</span>';
        appointmentsFeed.appendChild(card);
      });
    }).catch(function () {
      appointmentsFeed.innerHTML = '<p class="appointments-empty">Không thể tải lịch hẹn.</p>';
    });
  }

  apptBookBtn.addEventListener('click', function () {
    if (!state.token) {
      openModal('login');
      return;
    }
    var date = apptDate.value;
    if (!date) {
      alert('Vui lòng chọn ngày và giờ.');
      return;
    }
    apptBookBtn.disabled = true;
    apptBookBtn.textContent = 'Đang đặt...';

    api('/appointments', {
      method: 'POST',
      body: { date: date }
    }).then(function () {
      apptDate.value = '';
      loadAppointments();
    }).catch(function (err) {
      alert('Lỗi: ' + err.message);
    }).finally(function () {
      apptBookBtn.disabled = false;
      apptBookBtn.textContent = 'Đặt lịch';
    });
  });

  // ----------------------------------------------------------
  // Chat — Real-time human-to-human messaging
  // ----------------------------------------------------------
  var currentConvId = null;
  var lastMsgId = 0;
  var pollTimer = null;
  var contactsCache = [];
  var convsCache = [];

  function loadContacts() {
    if (!state.token) { contactsCache = []; return; }
    api('/chat/contacts').then(function (data) {
      contactsCache = data.contacts || [];
    }).catch(function () {});
  }

  function loadConversations() {
    if (!state.token) {
      contactsList.innerHTML = '<div class="posts-empty" style="padding:20px;text-align:center;font-size:0.85rem">Đăng nhập để xem tin nhắn</div>';
      return;
    }
    convsCache = [];
    api('/chat/conversations').then(function (data) {
      var els = document.querySelectorAll('.contact-item');
      els.forEach(function (el) { el.remove(); });
      convsCache = data.conversations || [];

      if (convsCache.length === 0) {
        if (contactsCache.length === 0) {
          contactsList.innerHTML = '<div class="posts-loading">Đang tải...</div>';
          loadContacts();
          var retries = 0;
          var retry = setInterval(function () {
            retries++;
            if (contactsCache.length > 0) { clearInterval(retry); renderSuggestedContacts(); }
            else if (retries >= 10) { clearInterval(retry); contactsList.innerHTML = '<div class="posts-empty" style="padding:20px;text-align:center;font-size:0.85rem">Không tải được danh sách</div>'; }
          }, 300);
        } else {
          renderSuggestedContacts();
        }
        updateOnlineCount();
        return;
      }

      contactsList.innerHTML = '';
      convsCache.forEach(function (conv) {
        var otherId = conv.user1_id === state.user.id ? conv.user2_id : conv.user1_id;
        var otherName = conv.user1_id === state.user.id ? conv.user2_name : conv.user1_name;
        var avatarColors = ['#4A6FA5', '#6B9C7B', '#E8A87C', '#E57373', '#9575CD'];
        var colorIdx = (otherId % avatarColors.length);

        var item = document.createElement('div');
        item.className = 'contact-item' + (currentConvId === conv.id ? ' active' : '');
        item.setAttribute('data-conv-id', conv.id);
        item.setAttribute('data-other-id', otherId);
        item.setAttribute('data-other-name', otherName);
        item.innerHTML =
          '<div class="contact-avatar" style="background:' + avatarColors[colorIdx] + ';">' +
            '<i class="fas fa-user"></i>' +
          '</div>' +
          '<div class="contact-info">' +
            '<div class="contact-name-row">' +
              '<span class="contact-name">' + escapeHtml(otherName) + '</span>' +
              '<span class="contact-time">' + (conv.last_message_at ? formatTime(conv.last_message_at) : '') + '</span>' +
            '</div>' +
            '<div class="contact-preview">' +
              '<span class="contact-status online"></span>' +
              '<span class="contact-msg">' + escapeHtml(conv.last_message || 'Nhắn tin ngay') + '</span>' +
            '</div>' +
          '</div>';
        item.addEventListener('click', function () {
          switchConversation(conv.id, otherId, otherName, avatarColors[colorIdx]);
        });
        contactsList.appendChild(item);
      });

      updateOnlineCount();
    }).catch(function () {
      contactsList.innerHTML = '<div class="posts-empty" style="padding:20px;text-align:center;font-size:0.85rem">Không thể tải</div>';
    });
  }

  function renderSuggestedContacts() {
    if (contactsCache.length === 0) {
      contactsList.innerHTML = '<div class="posts-empty" style="padding:20px;text-align:center;font-size:0.85rem">Không có người dùng nào</div>';
      return;
    }
    var agents = contactsCache.filter(function (c) { return c.is_agent; });
    var users = contactsCache.filter(function (c) { return !c.is_agent; });
    var avatarColors = ['#4A6FA5', '#6B9C7B', '#E8A87C', '#E57373', '#9575CD'];
    var html = '';

    var renderList = function (list, label, icon) {
      if (list.length === 0) return;
      html += '<div style="padding:12px 12px 4px;font-size:0.78rem;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px">' + label + '</div>';
      list.forEach(function (c, idx) {
        var color = avatarColors[(c.id || idx) % avatarColors.length];
        html +=
          '<div class="contact-item" data-agent-id="' + c.id + '" data-agent-name="' + escapeHtml(c.name) + '" data-agent-color="' + color + '">' +
            '<div class="contact-avatar" style="background:' + color + ';">' +
              '<i class="fas ' + icon + '"></i>' +
            '</div>' +
            '<div class="contact-info">' +
              '<div class="contact-name-row">' +
                '<span class="contact-name">' + escapeHtml(c.name) + '</span>' +
              '</div>' +
              '<div class="contact-preview">' +
                '<span class="contact-status online"></span>' +
                '<span class="contact-msg" style="color:var(--primary);font-weight:500">Nhấn để trò chuyện</span>' +
              '</div>' +
            '</div>' +
          '</div>';
      });
    };

    renderList(agents, 'Hỗ trợ viên', 'fa-user-shield');
    renderList(users, 'Người dùng', 'fa-user');

    contactsList.innerHTML = html || '<div class="posts-empty" style="padding:20px;text-align:center;font-size:0.85rem">Không có ai để trò chuyện</div>';

    document.querySelectorAll('.contact-item[data-agent-id]').forEach(function (item) {
      item.addEventListener('click', function () {
        var agentId = parseInt(item.getAttribute('data-agent-id'));
        var agentName = item.getAttribute('data-agent-name');
        var agentColor = item.getAttribute('data-agent-color');
        startConversationWith(agentId, agentName, agentColor);
      });
    });
  }

  function startConversationWith(agentId, agentName, agentColor) {
    if (!state.token) { openModal('login'); return; }
    api('/chat/conversations', {
      method: 'POST',
      body: { contact_id: agentId }
    }).then(function (data) {
      currentConvId = data.conversation.id;
      loadConversations();
      switchConversation(currentConvId, agentId, agentName, agentColor || '#4A6FA5');
    }).catch(function (err) {
      alert('Lỗi: ' + err.message);
    });
  }

  function switchConversation(convId, otherId, otherName, avatarColor) {
    if (convId === currentConvId) return;
    currentConvId = convId;
    lastMsgId = 0;
    chatInput.disabled = false;
    chatInput.placeholder = 'Nhập tin nhắn...';

    document.querySelectorAll('.contact-item').forEach(function (el) {
      el.classList.toggle('active', parseInt(el.getAttribute('data-conv-id')) === convId);
    });

    convAvatar.style.display = 'flex';
    convAvatar.style.background = avatarColor || '#4A6FA5';
    convAvatar.innerHTML = '<i class="fas fa-user"></i>';
    convName.textContent = otherName || 'Đang trò chuyện';
    convStatus.textContent = 'Đang online';
    convStatus.style.color = '#4CAF50';

    loadMessages(convId);
    startPolling(convId);

    if (window.innerWidth <= 768) {
      chatContacts.classList.add('hidden');
      chatConversation.classList.remove('hidden');
    }
  }

  function loadMessages(convId) {
    api('/chat/conversations/' + convId + '/messages?after=0').then(function (data) {
      chatMessages.innerHTML = '';
      var msgs = data.messages || [];
      msgs.forEach(function (m) {
        appendMessage(m.sender_id === state.user.id ? 'user' : 'other', m.text, false);
        if (m.id > lastMsgId) lastMsgId = m.id;
      });
      if (msgs.length === 0) {
        chatMessages.innerHTML = '<div class="posts-empty" style="padding:20px;text-align:center;font-size:0.85rem">Chưa có tin nhắn nào. Hãy gửi tin nhắn đầu tiên!</div>';
      }
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }).catch(function () {
      chatMessages.innerHTML = '<div class="posts-empty">Không thể tải tin nhắn</div>';
    });
  }

  function startPolling(convId) {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function () {
      if (!convId) return;
      api('/chat/conversations/' + convId + '/messages?after=' + lastMsgId).then(function (data) {
        var msgs = data.messages || [];
        if (msgs.length === 0) return;
        var emptyMsg = chatMessages.querySelector('.posts-empty');
        if (emptyMsg) emptyMsg.remove();
        msgs.forEach(function (m) {
          if (m.sender_id !== state.user.id) {
            appendMessage('other', m.text, true);
          }
          if (m.id > lastMsgId) lastMsgId = m.id;
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
        loadConversations();
      }).catch(function () {});
    }, 3000);
  }

  function appendMessage(type, text, animate) {
    var msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + (type === 'user' ? 'user' : 'bot');
    var bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    var time = document.createElement('span');
    time.className = 'bubble-time';
    var now = new Date();
    time.textContent = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    msgDiv.appendChild(bubble);
    msgDiv.appendChild(time);
    if (!animate) {
      msgDiv.style.animation = 'none';
      msgDiv.style.opacity = '1';
      msgDiv.style.transform = 'none';
    }
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function sendMessage() {
    if (!currentConvId) {
      if (!state.token) { openModal('login'); return; }
      var msg = chatInput.value.trim();
      startNewConversation();
      if (msg) chatInput.value = msg;
      return;
    }
    var text = chatInput.value.trim();
    if (!text || sendBtn.disabled) return;
    chatInput.value = '';
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.5';

    api('/chat/conversations/' + currentConvId + '/messages', {
      method: 'POST',
      body: { text: text }
    }).then(function (data) {
      var emptyMsg = chatMessages.querySelector('.posts-empty');
      if (emptyMsg) emptyMsg.remove();
      appendMessage('user', text, true);
      if (data.message && data.message.id > lastMsgId) lastMsgId = data.message.id;
      loadConversations();
    }).catch(function () {
      chatInput.value = text;
    }).finally(function () {
      sendBtn.disabled = false;
      sendBtn.style.opacity = '1';
    });
  }

  function startNewConversation() {
    loadContacts();
    loadConversations();
    if (window.innerWidth <= 768) {
      chatContacts.classList.remove('hidden');
      chatConversation.classList.add('hidden');
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  chatSearch.addEventListener('input', function () {
    var query = chatSearch.value.toLowerCase().trim();
    document.querySelectorAll('.contact-item').forEach(function (item) {
      var name = item.querySelector('.contact-name').textContent.toLowerCase();
      var msg = item.querySelector('.contact-msg').textContent.toLowerCase();
      item.style.display = (name.indexOf(query) !== -1 || msg.indexOf(query) !== -1) ? 'flex' : 'none';
    });
    updateOnlineCount();
  });

  function updateOnlineCount() {
    var visible = 0;
    document.querySelectorAll('.contact-item').forEach(function (item) {
      if (item.style.display !== 'none') visible++;
    });
    onlineCount.textContent = visible + ' liên hệ';
  }

  function formatTime(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    var now = new Date();
    var diff = (now - d) / 1000;
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return Math.floor(diff / 60) + 'p trước';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h trước';
    return d.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
  }

  document.getElementById('emojiBtn').addEventListener('click', function () { chatInput.focus(); });
  document.getElementById('attachBtn').addEventListener('click', function () { chatInput.focus(); });

  convBack.addEventListener('click', function () {
    if (pollTimer) clearInterval(pollTimer);
    currentConvId = null;
    chatContacts.classList.remove('hidden');
    chatConversation.classList.add('hidden');
  });

  function handleResize() {
    if (window.innerWidth > 768) {
      chatContacts.classList.remove('hidden');
      chatConversation.classList.remove('hidden');
    } else {
      if (!chatConversation.classList.contains('hidden')) {
        chatContacts.classList.add('hidden');
      } else {
        chatContacts.classList.remove('hidden');
        chatConversation.classList.add('hidden');
      }
    }
  }
  window.addEventListener('resize', handleResize);

  // ----------------------------------------------------------
  // Utility
  // ----------------------------------------------------------
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function translateStatus(status) {
    var map = { pending: 'Chờ duyệt', confirmed: 'Đã xác nhận', cancelled: 'Đã hủy', completed: 'Hoàn thành' };
    return map[status] || status;
  }

  // ----------------------------------------------------------
  // Init
  // ----------------------------------------------------------
  loadUser();
  loadPosts();
  loadAppointments();
  loadTestHistory();
  loadContacts();
  loadConversations();

  chatInput.disabled = true;
  chatInput.placeholder = 'Đăng nhập để trò chuyện';
  onlineCount.textContent = '0 liên hệ';
  convAvatar.style.display = 'none';
  revealSections();

})();
