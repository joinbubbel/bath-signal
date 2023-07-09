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
      const peer = await call.createPeerConnection(remoteUserId);
      await call.createPeerOffer(peer, remoteUserId);
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
  iceBox: Map<UserId, Array<RTCIceCandidate>>;
  remoteDescriptionSet: boolean;

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
    this.iceBox = new Map();
    this.remoteDescriptionSet = false;

    setInterval(async () => {
      this.poll();
    }, 1000);
  }

  async createPeerConnection(remoteUserId: UserId): Promise<RTCPeerConnection> {
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
      const message = {
        candidate: null,
      } as any;
      if (e.candidate) {
        message.candidate = e.candidate.candidate;
        message.sdpMid = e.candidate.sdpMid;
        message.sdpMLineIndex = e.candidate.sdpMLineIndex;
      }
      let res = await bathSignalApiSendICE({
        from: this.userId,
        user: remoteUserId,
        ice: JSON.stringify(message),
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

    return peer;
  }

  async createPeerOffer(peer: RTCPeerConnection, remoteUserId: UserId) {
    let offer = await peer.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    peer.setLocalDescription(offer);

    if (offer.sdp) {
      let res = await bathSignalApiSendOffer({
        from: this.userId,
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
      return await this.createPeerConnection(remoteUserId);
    } else {
      return peer;
    }
  }

  async poll() {
    const localUserId = this.userId;
    let res = await bathSignalApiCheckMailbox({
      user: localUserId,
    });

    if (this.remoteDescriptionSet) {
      for (let userId in this.iceBox) {
        let ices = this.iceBox.get(userId)!;
        let peer = await this.getInsertPeer(userId);
        for (let iceIndex in ices) {
          let ice = ices[iceIndex];
          await peer.addIceCandidate(ice);
        }
      }
    }

    if (res.messages) {
      for (let index in res.messages) {
        const message = res.messages[index];
        let peer = await this.getInsertPeer(message.from);
        switch (message.ty) {
          case "IncomingOffer":
              console.log("Got offer");
            await peer.setRemoteDescription(JSON.parse(message.data));
            this.remoteDescriptionSet = true;
            let answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            let res = await bathSignalApiSendAnswer({
              from: localUserId,
              user: message.from,
              answer: JSON.stringify(answer),
            });
            if (res.error) {
              throw "Got Error from Send Answer.";
            }
            break;
          case "IncomingAnswer":
            await peer.setRemoteDescription(JSON.parse(message.data));
            this.remoteDescriptionSet = true;
            break;
          case "IncomingICE":
            let candidate = JSON.parse(message.data);
            if (candidate.candidate) {
              if (this.remoteDescriptionSet) {
                await peer.addIceCandidate(candidate);
              } else {
                if (!this.iceBox.get(message.from)) {
                  this.iceBox.set(message.from, []);
                }
                this.iceBox.get(message.from)!.push(candidate);
              }
            }
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

export { createCall, joinCall, CallSession, type UserId };
