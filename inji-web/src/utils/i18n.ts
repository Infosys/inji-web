import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import ta from '../locales/ta.json';
import hi from '../locales/hi.json';
import kn from '../locales/kn.json';
import ar from '../locales/ar.json';
import {storage} from "./storage";
import {DisplayArrayObject, LanguageObject} from "../types/data";

const resources = {en, ta, kn, hi, fr, ar};

export const LanguagesSupported: LanguageObject[] = [
    {label: "English", value: 'en'},
    {label: "தமிழ்", value: 'ta'},
    {label: "ಕನ್ನಡ", value: 'kn'},
    {label: "हिंदी", value: 'hi'},
    {label: "Français", value: 'fr'},
    {label: "عربي", value: 'ar'}
];

export const defaultLanguage = window._env_ ? window._env_.DEFAULT_LANG : 'en';

export const initializeI18n = () => {
    const selected_language = storage.getItem(storage.SELECTED_LANGUAGE);

    return i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: selected_language || defaultLanguage,
            fallbackLng: defaultLanguage,
            interpolation: {
                escapeValue: false
            },
        });
};

// Immediately initialize i18n, but export the promise for testing
export const i18nInitialized = initializeI18n();

export const switchLanguage = async (language: string) => {
    storage.setItem(storage.SELECTED_LANGUAGE, language);
    await i18n.changeLanguage(language);
}

export const getObjectForCurrentLanguage = (displayArray: DisplayArrayObject[], language: string = i18n.language) => {
    let resp = displayArray.filter(displayObj => (displayObj.language === language || displayObj.locale === language))[0];
    if (!resp) {
        resp = displayArray.filter(displayObj => (
            displayObj.language === defaultLanguage || 
            displayObj.locale === defaultLanguage
        ))[0];
    }
    return resp;
}

export const getDirCurrentLanguage = (language: string) => {
    return isRTL(language) ? 'rtl' : 'ltr';
}

export const isRTL = (language:string) => {
    return language === 'ar';
}

export default i18n;