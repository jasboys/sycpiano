export interface PersonalInfoShape {
    className?: string;
    position: Array<{
        title?: string;
        organization?: string;
    }>;
    name: string;
}

export interface PersonalContactShape {
    className?: string;
    phone?: string[];
    email: string[];
    website?: string;
}

export interface ContactSocialMediaShape {
    className?: string;
    social: { [key: string]: string };
}

export type ContactItemShape = (
    PersonalInfoShape
    & PersonalContactShape
    & ContactSocialMediaShape
);
