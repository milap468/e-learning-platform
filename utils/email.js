import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to,subject,html) => {
    const res = resend.emails.send({
        from: 'onboarding@resend.dev',
        to: to,
        subject: subject,
        html: html
    });

    return res
}

export default sendEmail;

