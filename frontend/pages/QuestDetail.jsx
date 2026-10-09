import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Compass,
  ImagePlus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { quests, submissions } from "../api";

export default function QuestDetail() {
  const { id } = useParams();
  const [quest, setQuest] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [phase, setPhase] = useState("brief");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(true);
  const [sending, setSending] = useState(false);
  const ref = useRef();

  useEffect(() => {
    let live = true;
    quests
      .one(id)
      .then((q) => live && setQuest(q))
      .catch((e) => live && setErr(e.message))
      .finally(() => live && setBusy(false));

    return () => {
      live = false;
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function pick(f) {
    if (!f) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setErr("Choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      setErr("Image must be under 5 MB.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setErr("");
  }

  async function send() {
    setSending(true);
    setErr("");

    try {
      const r = await submissions.send(
        String(quest.id),
        file,
        crypto.randomUUID()
      );
      setResult(r);
      setPhase("result");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSending(false);
    }
  }

  if (busy) {
    return <main className="shell loading">Opening field note…</main>;
  }

  if (!quest) {
    return (
      <main className="shell empty">
        <h2>Quest not found</h2>
        <p>{err}</p>
        <Link to="/quests">Back to quests</Link>
      </main>
    );
  }

  const status = {
    approved: "Quest approved",
    rejected: "Not quite this time",
    needs_review: "Needs a closer look",
    pending: "Verification pending",
  };

  return (
    <main className="shell">
      <div className="back">
        <Link to="/quests">
          <ArrowLeft size={15} /> QUEST ARCHIVE
        </Link>
        <span>FIELD NOTE / {String(quest.id).padStart(3, "0")}</span>
      </div>

      <div className="detail-grid">
        <article>
          <div className={`detail-art art-${quest.id % 5}`}>
            <span>GT / {String(quest.id).padStart(3, "0")}</span>
            <b>
              GO
              <br />
              LOOK
              <br />
              CLOSER ↘
            </b>
          </div>

          <div className="detail-title">
            <div>
              <small>THE ASSIGNMENT</small>
              <h1>
                {quest.title}
                <em>.</em>
              </h1>
            </div>
            <strong>
              <Sparkles size={16} />
              {quest.base_xp} XP
            </strong>
          </div>

          <p className="description">{quest.description}</p>

          <div className="meta-line">
            <span>
              <Clock3 size={14} />
              {quest.estimated_minutes} MINUTES
            </span>
            <span>
              <Compass size={14} />
              {quest.difficulty.toUpperCase()}
            </span>
            <span>{quest.time_slot.toUpperCase()}</span>
          </div>

          {phase === "brief" && (
            <>
              <section className="instructions">
                <small>YOUR FIELD INSTRUCTIONS</small>
                <ol>
                  <li>
                    <b>01</b>Find a safe, publicly accessible place.
                  </li>
                  <li>
                    <b>02</b>{quest.description}
                  </li>
                  <li>
                    <b>03</b>{quest.proof_instructions}
                  </li>
                </ol>
              </section>

              <div className="safety">
                <ShieldCheck size={20} />
                <div>
                  <b>FIELD SAFETY FIRST</b>
                  <p>
                    {quest.safety_notes} Never trespass or put yourself at risk
                    for a photo.
                  </p>
                </div>
              </div>

              <button className="primary" onClick={() => setPhase("active")}>
                Start this quest <ArrowRight size={16} />
              </button>
            </>
          )}

          {phase === "active" && (
            <section className="upload">
              <small>YOUR FIELD EVIDENCE</small>
              <h2>
                Go on. We'll be <em>here.</em>
              </h2>
              <p>
                Put your phone away while you explore. When you're back, select the
                photo that best shows what you found.
              </p>

              <button className="upload-box" onClick={() => ref.current?.click()}>
                <input
                  hidden
                  ref={ref}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => pick(e.target.files?.[0])}
                />
                {preview ? (
                  <img src={preview} alt="Selected quest evidence preview" />
                ) : (
                  <>
                    <ImagePlus size={27} />
                    <b>Choose your field photo</b>
                    <small>JPEG, PNG, WebP · up to 5 MB</small>
                    <span>Browse files ↗</span>
                  </>
                )}
              </button>

              {file && (
                <p className="selected">
                  {file.name}
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview("");
                    }}
                  >
                    Remove
                  </button>
                </p>
              )}

              {err && <p className="error">{err}</p>}

              <div className="actions">
                <button className="outline" onClick={() => setPhase("brief")}>
                  Back
                </button>
                <button
                  className="primary"
                  disabled={!file || sending}
                  onClick={send}
                >
                  {sending ? "Sending…" : "Submit for review"}{" "}
                  <ArrowRight size={15} />
                </button>
              </div>

              <p className="muted">
                XP is only awarded after the backend confirms approval.
              </p>
            </section>
          )}

          {phase === "result" && (
            <section className="result">
              <CheckCircle2 size={27} />
              <small>SUBMISSION / #{result?.id}</small>
              <h2>{status[result?.status] || "Submission received"}.</h2>
              <p>{result?.verification_reason}</p>

              {result?.status === "approved" ? (
                <strong className="reward">
                  <Sparkles /> +{result.xp_awarded} XP
                </strong>
              ) : (
                <p className="muted">No XP is added until approval is confirmed.</p>
              )}

              <div className="actions">
                <Link className="outline" to="/progress">
                  My journal
                </Link>
                <Link className="primary" to="/quests">
                  Find another quest
                </Link>
              </div>
            </section>
          )}
        </article>

        <aside className="detail-aside">
          <small>A NOTE TO SELF</small>
          <blockquote>
            “The ordinary world is full of extraordinary details.”
          </blockquote>
          <hr />

          <small>TIME REQUIRED</small>
          <h3>{quest.estimated_minutes} minutes</h3>
          <p>There's no rush.</p>

          <small>YOUR REWARD</small>
          <h3>{quest.base_xp} XP</h3>
          <p>Added only after approval.</p>

          <small>PROOF REQUIRED</small>
          <p>{quest.proof_instructions}</p>
        </aside>
      </div>

      <footer className="footer">
        <span>GROUNDTRUTH / FIELD NOTE {quest.id}</span>
        <span>LEAVE IT BETTER THAN YOU FOUND IT.</span>
      </footer>
    </main>
  );
}