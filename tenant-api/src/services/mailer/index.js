import fp from 'fastify-plugin';
import nodemailer from 'nodemailer';

function resolveMailerConfig() {
    const host = process.env.MAILER_SMTP_HOST || 'sandbox.smtp.mailtrap.io';
    const port = Number(process.env.MAILER_SMTP_PORT || 2525 || 587);
    const user = process.env.MAILER_SMTP_USER || process.env.MAILTRAP_USER || '';
    const pass = process.env.MAILER_SMTP_PASS || process.env.MAILTRAP_PASS || '';
    const from = process.env.MAILER_FROM || 'no-reply@freightezcrm.com';

    return { host, port, user, pass, from };
}

export const registerMailer = fp(async (app) => {
    const config = resolveMailerConfig();

    if (!config.user || !config.pass) {
        app.log.warn(
            {
                module: 'mailer',
                host: config.host,
                port: config.port
            },
            'Mailer credentials missing; emails will be logged instead of sent'
        );

        app.decorate('mailer', {
            async sendMail(payload) {
                app.log.info(
                    {
                        module: 'mailer',
                        mode: 'dry-run',
                        to: payload?.to,
                        subject: payload?.subject
                    },
                    'Mailer fallback send'
                );

                return {
                    accepted: [],
                    rejected: [],
                    envelope: {
                        to: Array.isArray(payload?.to) ? payload.to : [payload?.to],
                        from: payload?.from || config.from
                    },
                    messageId: `dry-run-${Date.now()}`
                };
            }
        });

        return;
    }

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        auth: {
            user: config.user,
            pass: config.pass
        }
    });

    if (process.env.NODE_ENV !== 'production') {
        transporter
            .verify()
            .then(() => {
                app.log.info(
                    {
                        module: 'mailer',
                        host: config.host,
                        port: config.port
                    },
                    'Mailer transporter verified'
                );
            })
            .catch((error) => {
                app.log.warn(
                    {
                        module: 'mailer',
                        host: config.host,
                        port: config.port,
                        error
                    },
                    'Mailer transporter verification failed'
                );
            });
    }

    app.decorate('mailer', {
        async sendMail(payload) {
            const message = {
                from: config.from,
                ...payload
            };

            return transporter.sendMail(message);
        }
    });
});

