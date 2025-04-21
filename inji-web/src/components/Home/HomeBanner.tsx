import React from "react";
import { useTranslation } from "react-i18next";

export const HomeBanner: React.FC = () => {
    const {t} = useTranslation("HomePage");
    return (
        <div data-testid="HomeBanner-Container" className="py-2 pb-10 ">
            <div 
                data-testid="HomeBanner-Content" 
                className="mt-8 sm:mx-[4%] sm:rounded-xl pt-12 pb-6 sm:pt-16 sm:pb-8 px-[2%] sm:px-[5%] flex flex-col justify-center items-center bg-home-banner h-1/6"
            >
                <span data-testid="HomeBanner-Heading" className="text-4xl sm:text-6xl text-iw-text font-semibold text-wrap w-full sm:w-[80%] text-center pb-4">
                    {t("Banner.heading")}
                </span>
                <span data-testid="HomeBanner-Description" className="text-iw-text my-6 text-xl font-extralight w-[90%] sm:w-[57%] text-pretty text-center pb-8">
                    {t("Banner.description")}
                </span>
            </div>
        </div>
    );
}
