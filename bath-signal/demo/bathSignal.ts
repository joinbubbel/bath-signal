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
  from: string;
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
  from: string;
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
  from: string;
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
  from: UserId;
};

type ResCheckMailbox = {
  error: CheckMailboxError | null;
  messages: MailboxMessage[] | null;
};

async function bathSignalApiCreateCall(): Promise<ResCreateCall> {
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
  let res = await bathSignalApiCreateCall();
  if (res.error) {
    throw "Got Error from Create Call.";
  } else {
    return res.call;
  }
}

async function joinCall(
  localUserId: UserId,
  callId: CallId,
  gotRemote: (userId: UserId, e: RTCTrackEvent) => void,
): Promise<CallSession> {
  let res = await bathSignalApiJoinQuery({
    call: callId,
    user: localUserId,
  });

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });

  let call = new CallSession(stream, localUserId, callId, gotRemote);
  if (res.users) {
    for (let index in res.users) {
      const remoteUserId = res.users[index];
      call.createPeerConnection(localUserId, remoteUserId);
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

    setInterval(async () => {
      this.poll();
    }, 1000);
  }

  async createPeerConnection(localUserId: UserId, remoteUserId: UserId) {
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
    this.peers.set(remoteUserId, peer);
    peer.onicecandidate = async (e) => {
      let res = await bathSignalApiSendICE({
        from: localUserId,
        user: remoteUserId,
        ice: JSON.stringify(e.candidate),
      });
      if (res.error) {
        throw "Got Error for Send ICE.";
      }
    };
    peer.ontrack = (e) => {
      this.gotRemote(remoteUserId, e);
    };

    this.stream
      .getTracks()
      .forEach((track) => peer.addTrack(track, this.stream));

    let offer = await peer.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    peer.setLocalDescription(offer);

    if (offer.sdp) {
      let res = await bathSignalApiSendOffer({
        from: localUserId,
        user: remoteUserId,
        offer: JSON.stringify(offer),
      });
      if (res.error) {
        throw "Got Error from Send Offer.";
      }
    } else {
      throw "Did not get offer SDP.";
    }
  }

  async getInsertPeer(remoteUserId: UserId): Promise<RTCPeerConnection> {
    let peer = this.peers.get(remoteUserId);
    if (!peer) {
      await this.createPeerConnection(this.userId, remoteUserId);
      return this.peers.get(remoteUserId)!;
    } else {
      return peer;
    }
  }

  async poll() {
    const localUserId = this.userId;
    let res = await bathSignalApiCheckMailbox({
      user: localUserId,
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
              from: localUserId,
              user: remoteUserId,
              answer: JSON.stringify(answer),
            });
            console.log("sending answer");
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
  }
}

export { createCall, joinCall, CallSession };
