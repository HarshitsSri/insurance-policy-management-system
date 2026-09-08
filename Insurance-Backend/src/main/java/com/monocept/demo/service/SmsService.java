package com.monocept.demo.service;

import org.springframework.stereotype.Service;

import com.monocept.demo.config.TwilioConfig;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmsService {

    private final TwilioConfig twilioConfig;

    public void sendOtpSms(String toPhoneNumber, String otp) {
        // Ensure E.164 format e.g. +919876543210
        String formattedNumber = toPhoneNumber.startsWith("+") 
                ? toPhoneNumber 
                : "+91" + toPhoneNumber; // default to India prefix; adjust as needed

        Message message = Message.creator(
                new PhoneNumber(formattedNumber),
                new PhoneNumber(twilioConfig.getPhoneNumber()),
                "Your Insurance Portal OTP is: " + otp + ". Valid for 15 minutes. Do not share it with anyone."
        ).create();

        log.info("SMS sent to {} | SID: {}", formattedNumber, message.getSid());
    }
}
