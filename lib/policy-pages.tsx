import type { ReactNode } from "react";

export type PolicyPage = { title: string; description: string; eyebrow: string; body: ReactNode };

export const policyPages: Record<string, PolicyPage> = {
  about: {
    eyebrow: "ABOUT PULLVIO",
    title: "Building a calmer way to work with media.",
    description: "Pullvio is a browser-based media tool developed around clear choices, reliable processing, and responsible use.",
    body: <>
      <h2>Why Pullvio exists</h2>
      <p>Online media workflows are often surrounded by confusing format labels, intrusive advertising, fake buttons, and unclear privacy claims. Pullvio is a more considered alternative: a focused workspace that explains what it can do, what it cannot do, and what happens during processing.</p>
      <p>Pullvio works directly in mobile and desktop browsers, helping users save media they own or have permission to use as MP4 video or MP3 audio. Guests can try the tool without an account, while a free account supports ongoing use and download history within fair-use limits.</p>
      <h2>What we focus on</h2>
      <p>The product is built around a reliable end-to-end workflow, from link analysis and format selection to file delivery. New sources, formats, and account features are added after they have been tested for stability.</p>
      <h2>Our product principles</h2>
      <ul><li>Explain formats and available quality in plain language.</li><li>Respect source quality instead of promising artificial resolution.</li><li>Make permission and responsible use visible in the main workflow.</li><li>Explain temporary-file handling and deletion behavior.</li><li>Keep the free experience understandable on mobile and desktop.</li></ul>
      <h2 id="editorial-standards">Editorial standards</h2>
      <p>Pullvio guides are written and reviewed by the Pullvio Editorial Team. Technical articles distinguish documented behavior from inference, link to primary specifications where practical, and state product limits instead of presenting unverified features as facts. Material changes receive a new reviewed date; dates are not changed solely to make an article appear fresh.</p>
      <div className="content-callout"><strong>Independent product</strong><p>Pullvio is not affiliated with TikTok, Vimeo, SoundCloud, or any other media platform. Platform names are used only to describe compatibility.</p></div>
    </>,
  },
  contact: {
    eyebrow: "CONTACT",
    title: "Talk to the Pullvio team.",
    description: "Questions about the product, privacy, accessibility, or copyright can be directed to the appropriate Pullvio inbox.",
    body: <>
      <h2>General and product feedback</h2>
      <p>Email <a href="mailto:hello@pullvio.com">hello@pullvio.com</a> for product feedback, accessibility issues, partnership questions, or corrections to our published guides.</p>
      <h2>Privacy questions</h2>
      <p>Email <a href="mailto:privacy@pullvio.com">privacy@pullvio.com</a> for questions about personal data, cookies, account information, or a privacy request.</p>
      <h2>Copyright notices</h2>
      <p>Email <a href="mailto:copyright@pullvio.com">copyright@pullvio.com</a> for copyright and takedown matters. Include enough information to identify the work, the relevant location, your authority to act, and a reliable way to contact you.</p>
      <h2>Response expectations</h2>
      <p>We aim to acknowledge legitimate support and policy messages within five business days, but this is not an emergency or real-time support channel.</p>
      <div className="content-callout"><strong>Official contact channels</strong><p>Messages about product support, privacy, and copyright should be sent to the relevant Pullvio domain inbox above.</p></div>
    </>,
  },
  privacy: {
    eyebrow: "PRIVACY",
    title: "Privacy policy.",
    description: "This policy explains the data Pullvio uses to provide accounts, media processing, security, and support.",
    body: <>
      <h2>How Pullvio handles data</h2>
      <p>Pullvio provides account access and browser-based media processing. We use the minimum information reasonably needed to analyze submitted links, prepare requested files, deliver results, secure the service, and support users.</p>
      <h2>Data the site may handle</h2>
      <ul><li><strong>Basic access data:</strong> hosting and security providers may process IP address, browser type, requested URL, timestamps, and diagnostic information needed to deliver and protect the service.</li><li><strong>Processing data:</strong> submitted source URLs, requested format and quality, job status, and limited technical logs may be used to complete a request and investigate failures.</li><li><strong>Local preferences:</strong> theme and language preferences may be stored in your browser using local storage.</li><li><strong>Account data:</strong> the authentication provider may process your email address, account identifier, session tokens, and login method.</li><li><strong>Messages you send:</strong> if you contact Pullvio, we receive the address and content you choose to provide.</li></ul>
      <h2>Cookies and local storage</h2>
      <p>Authentication uses security cookies to maintain a signed-in session. Theme and language choices may be stored locally in the browser. Non-essential advertising or marketing cookies require an appropriate consent mechanism where applicable.</p>
      <h2>Service providers</h2>
      <p>The service may rely on hosting, media-processing, storage, authentication, email, security, and analytics providers. These providers process data only for the services they supply to Pullvio.</p>
      <h2>Retention and requests</h2>
      <p>Temporary processing files are retained only as long as reasonably needed to complete and deliver a job, then deleted automatically. Security and support records may be kept longer where needed for abuse prevention, dispute handling, or legal obligations. You may request access, correction, or deletion by emailing <a href="mailto:privacy@pullvio.com">privacy@pullvio.com</a>, subject to applicable law and necessary records.</p>
    </>,
  },
  terms: {
    eyebrow: "TERMS",
    title: "Terms of use.",
    description: "These terms govern access to Pullvio, its media-processing tools, free accounts, and published guides.",
    body: <>
      <h2>Service availability</h2>
      <p>Pullvio provides online media-processing tools, free account features, and educational content. Availability, supported sources, formats, and fair-use limits may change as the service evolves.</p>
      <h2>Permitted use</h2>
      <p>You may use Pullvio only for content you own, public-domain content, openly licensed content used within its license, or content you otherwise have permission or a legal right to save.</p>
      <h2>Prohibited behavior</h2>
      <ul><li>Attempting to bypass access controls, DRM, subscriptions, private accounts, or technical restrictions.</li><li>Using the service to infringe copyright, privacy, publicity, contractual, or other rights.</li><li>Automated abuse, excessive requests, security testing without permission, malware, or interference with the service.</li><li>Misrepresenting Pullvio as affiliated with a third-party platform.</li></ul>
      <h2>No legal advice or guaranteed availability</h2>
      <p>Published guides provide general educational information and are not legal advice. Laws and platform terms vary. Public-site content is provided as available and may change, move, or be withdrawn.</p>
      <h2>Accounts and fair use</h2>
      <p>You are responsible for maintaining account security. Free accounts do not have a fixed download cap, but automated abuse, excessive resource use, attempts to evade safety limits, and activity that risks service availability may be restricted.</p>
      <h2>Contact</h2>
      <p>Questions about these terms may be sent to <a href="mailto:hello@pullvio.com">hello@pullvio.com</a>.</p>
    </>,
  },
  copyright: {
    eyebrow: "COPYRIGHT",
    title: "Copyright and takedown policy.",
    description: "Pullvio is intended for authorized media workflows and provides a channel for rights holders to report specific concerns.",
    body: <>
      <h2>Respect for creative work</h2>
      <p>Pullvio is designed for a user’s own uploads, public-domain material, openly licensed works, and content the user has permission or another valid legal basis to save. The service is not intended to bypass DRM, paid access, private accounts, or platform restrictions.</p>
      <h2>Submitting a notice</h2>
      <p>Send copyright notices to <a href="mailto:copyright@pullvio.com">copyright@pullvio.com</a>. A useful notice should include:</p>
      <ol><li>Identification of the copyrighted work or authorized representative.</li><li>The exact Pullvio URL, job reference, or other information needed to locate the reported material or activity.</li><li>Your name, organization if applicable, and reliable contact details.</li><li>A statement explaining why you believe the use is unauthorized.</li><li>A statement that the information is accurate and that you are authorized to act.</li><li>Your physical or electronic signature where required.</li></ol>
      <h2>Review and response</h2>
      <p>We may request clarification, restrict access, preserve necessary records, or take other proportionate steps while reviewing a complete notice. Knowingly false or materially misleading notices may create liability.</p>
      <h2>Counter-notices and repeat misuse</h2>
      <p>Where applicable, users may be offered a process to respond to a notice. Repeated infringement or abuse may result in job cancellation, account restrictions, or termination.</p>
      <div className="content-callout"><strong>Specific reports help us act</strong><p>Include the exact Pullvio URL, job reference, or account information needed to identify the reported activity without sending unrelated personal data.</p></div>
    </>,
  },
  "acceptable-use": {
    eyebrow: "ACCEPTABLE USE",
    title: "Acceptable use policy.",
    description: "Pullvio is designed for legitimate personal, creative, archival, and educational workflows—not access-control circumvention.",
    body: <>
      <h2>Acceptable examples</h2>
      <ul><li>Backing up media you created and uploaded yourself.</li><li>Saving public-domain material or openly licensed work in accordance with its license.</li><li>Working with media for which the creator or rights holder gave you permission.</li><li>Preparing authorized references for editing, teaching, research, accessibility, or offline use.</li></ul>
      <h2>Uses that are not accepted</h2>
      <ul><li>Downloading or distributing copyrighted material without permission or another valid legal basis.</li><li>Bypassing DRM, paywalls, authentication, private-account controls, geographic restrictions, or other access controls.</li><li>Processing illegal, exploitative, abusive, or privacy-invasive content.</li><li>Using automation to overwhelm the service, evade limits, scrape results, or resell access without authorization.</li><li>Introducing malware, probing infrastructure, or interfering with other users.</li></ul>
      <h2>Enforcement</h2>
      <p>Pullvio may limit requests, suspend jobs, restrict accounts, preserve security records, or cooperate with valid legal processes. Enforcement decisions may consider intent, severity, recurrence, and risk to other people or the service.</p>
      <h2>Your responsibility</h2>
      <p>You are responsible for understanding the rights attached to the media you use and for complying with applicable law and platform terms. A technically accessible URL does not by itself establish permission to save or reuse its content.</p>
    </>,
  },
};
