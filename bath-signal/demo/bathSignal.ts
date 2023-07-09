type ResCreateCall = {
  error: unknown;
  call: number;
};

type JoinQuery = {
  call: number;
  user: string;
};

type JoinQueryError = {
  type: string;
};

type ResJoinQuery = {
  error: JoinQueryError | null;
  users: string[] | null;
};

type SendOffer = {
  user: string;
  offer: string;
};

type SendOfferError = {
  type: string;
};

type ResSendOffer = {
  error: SendOfferError | null;
};

type SendAnswer = {
  user: string;
  answer: string;
};

type SendAnswerError = {
  type: string;
};

type ResSendAnswer = {
  error: SendAnswerError | null;
};

type SendICE = {
  user: string;
  ice: string;
};

type SendICEError = {
  type: string;
};

type ResSendICE = {
  error: SendICEError | null;
};

type CheckMailbox = {
  user: string;
};

type CheckMailboxError = {
  type: string;
};

type MailboxMessage = {
  ty: string;
  data: string;
};

type ResCheckMailbox = {
  error: CheckMailboxError | null;
  messages: MailboxMessage[] | null;
};

async function bathSignalApiCreateCall() {
  let fetchRes = await fetch(
    "https://bath-signal-test.onrender.com/api/call/create_call",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    },
  );
  let res = await fetchRes.text();
  return JSON.parse(res);
}

async function bathSignalApiJoinQuery(req: JoinQuery): Promise<ResJoinQuery> {
  let fetchRes = await fetch(
    "https://bath-signal-test.onrender.com/api/call/join_query",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    },
  );
  let res = await fetchRes.text();
  return JSON.parse(res);
}

async function bathSignalApiSendOffer(req: SendOffer): Promise<ResSendOffer> {
  let fetchRes = await fetch(
    "https://bath-signal-test.onrender.com/api/call/send_offer",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(req),
    },
  );
  let res = await fetchRes.text();
  return JSON.parse(res);
}

async function bathSignalApiSendAnswer(
  req: SendAnswer,
): Promise<ResSendAnswer> {
  let fetchRes = await fetch(
    "https://bath-signal-test.onrender.com/api/call/send_answer",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    },
  );
  let res = await fetchRes.text();
  return JSON.parse(res);
}

async function bathSignalApiSendICE(req: SendICE): Promise<ResSendICE> {
  let fetchRes = await fetch(
    "https://bath-signal-test.onrender.com/api/call/send_ice",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    },
  );
  let res = await fetchRes.text();
  return JSON.parse(res);
}

async function bathSignalApiCheckMailbox(
  req: CheckMailbox,
): Promise<ResCheckMailbox> {
  let fetchRes = await fetch(
    "https://bath-signal-test.onrender.com/api/call/check_mailbox",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(req),
    },
  );
  let res = await fetchRes.text();
  return JSON.parse(res);
}

type CallId = number;
type UserId = string;

async function createCall(): Promise<CallId> {
  return await bathSignalApiCreateCall();
}

async function joinCall(
  userId: UserId,
  callId: CallId,
  gotRemote: (userId: UserId, e: RTCTrackEvent) => void,
): Promise<CallSession> {
  let res = await bathSignalApiJoinQuery({
    call: callId,
    user: userId,
  });

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });

  let call = new CallSession(stream, userId, callId, gotRemote);
  if (res.users) {
    for (let index in res.users) {
      const user = res.users[index];
      call.createPeerConnection(user);
    }
  } else {
    throw "Got Error from Join Query.";
  }

  return call;
}

class CallSession {
  userId: UserId;
  callId: CallId;
  stream: MediaStream;
  peers: Map<UserId, RTCPeerConnection>;
  gotRemote: (userId: UserId, e: RTCTrackEvent) => void;

  constructor(
    stream: MediaStream,
    userId: UserId,
    callId: CallId,
    gotRemote: (userId: UserId, e: RTCTrackEvent) => void,
  ) {
    this.userId = userId;
    this.callId = callId;
    this.stream = stream;
    this.gotRemote = gotRemote;
    this.peers = new Map();
  }

  async createPeerConnection(userId: UserId) {
    const config = {
      iceServers: [
        { urls: "stun:stun.stunprotocol.org:3478" },
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: ["turn:numb.viagenie.ca"],
          credential: "muazkh",
          username: "webrtc@live.com",
        },
        {
          urls: ["turn:turn.bistri.com:80"],
          credential: "homeo",
          username: "homeo",
        },
        {
          urls: ["turn:turn.anyfirewall.com:443?transport=tcp"],
          credential: "webrtc",
          username: "webrtc",
        },
      ],
    };
    const peer = new RTCPeerConnection(config);
    peer.onicecandidate = async (e) => {
      let res = await bathSignalApiSendICE({
        user: userId,
        ice: JSON.stringify(e.candidate),
      });
      if (res.error) {
        throw "Got Error for Send ICE.";
      }
    };
    peer.ontrack = (e) => {
      this.gotRemote(userId, e);
    };

    this.stream.getTracks().forEach((track) => peer.addTrack(track));

    let offer = await peer.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    peer.setLocalDescription(offer);

    if (offer.sdp) {
      let res = await bathSignalApiSendOffer({
        user: userId,
        offer: JSON.stringify(offer),
      });
      if (res.error) {
        throw "Got Error from Send Offer.";
      }
    } else {
      throw "Did not get offer SDP.";
    }

    setInterval(async () => {
      let res = await bathSignalApiCheckMailbox({
        user: userId,
      });
      if (res.messages) {
        for (let index in res.messages) {
          const message = res.messages[index];
          switch (message.ty) {
            case "IncomingOffer":
              peer.setRemoteDescription(JSON.parse(message.data));
              let answer = await peer.createAnswer();
              peer.setLocalDescription(answer);
              let res = await bathSignalApiSendAnswer({
                user: userId,
                answer: JSON.stringify(answer),
              });
              if (res.error) {
                throw "Got Error from Send Answer.";
              }
              break;
            case "IncomingAnswer":
              peer.setRemoteDescription(JSON.parse(message.data));
              break;
            case "IncomingICE":
              peer.addIceCandidate(JSON.parse(message.data));
              break;
            default:
              throw "Got Unknown Message from Mailbox.";
          }
        }
      } else {
        throw "Got Error from Check Mailbox.";
      }
    }, 1000);
  }
}

export { createCall, joinCall, CallSession };
