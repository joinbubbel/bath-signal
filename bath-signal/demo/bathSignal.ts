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

async function create_call() {
  let fetchRes = await fetch(
    "https://bath-signal-test.onrender.com/api/call/create_call",
    {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    },
  );
  let res = await fetchRes.text();
  return JSON.parse(res);
}

async function join_query(req: JoinQuery): Promise<ResJoinQuery> {
  let fetchRes = await fetch(
    "https://bath-signal-test.onrender.com/api/call/join_query",
    {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    },
  );
  let res = await fetchRes.text();
  return JSON.parse(res);
}

async function send_offer(req: SendOffer): Promise<ResSendOffer> {
  let fetchRes = await fetch(
    "https://bath-signal-test.onrender.com/api/call/send_offer",
    {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify(req),
    },
  );
  let res = await fetchRes.text();
  return JSON.parse(res);
}

async function send_answer(req: SendAnswer): Promise<ResSendAnswer> {
  let fetchRes = await fetch(
    "https://bath-signal-test.onrender.com/api/call/send_answer",
    {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    },
  );
  let res = await fetchRes.text();
  return JSON.parse(res);
}

async function send_ice(req: SendICE): Promise<ResSendICE> {
  let fetchRes = await fetch(
    "https://bath-signal-test.onrender.com/api/call/send_ice",
    {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    },
  );
  let res = await fetchRes.text();
  return JSON.parse(res);
}

async function check_mailbox(req: CheckMailbox): Promise<ResCheckMailbox> {
  let fetchRes = await fetch(
    "https://bath-signal-test.onrender.com/api/call/check_mailbox",
    {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify(req),
    },
  );
  let res = await fetchRes.text();
  return JSON.parse(res);
}
