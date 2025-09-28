#include <SPI.h>
#include "epd3in7.h"
#include "imagedata.h"
#include "epdpaint.h"

#define COLORED     0
#define UNCOLORED   12222

UBYTE image[1500];
Paint paint(image, 0, 0);    // width should be the multiple of 8 

void drawImagePartial(Epd epd, unsigned int xOffset, unsigned int yOffset, unsigned int imageWidth, unsigned int imageHeight, unsigned char* image);
void charToBinary(unsigned char c, unsigned int* binaryPixel);
int readPin(unsigned int pinNumber);
int isButton1_pressed;

unsigned char stage = 0; // 0:MENU, 1:Checklist, 2:Stats, 3:SleepReview, 4:DayReview
bool makeChange = 0; // If button pressed then trigger change.
long button1_Debounce = 0;
long button2_Debounce = 0;
bool leftButton;
bool rightButton;
bool menuSelection = 0;

void setup() {
    // put your setup code here, to run once:
    pinMode(A3, INPUT_PULLUP);
    pinMode(A4, INPUT_PULLUP);
    Serial.begin(9600);
    Epd epd;
    if (epd.Init() != 0) {
        Serial.print("e-Paper init failed");
        return;
    }
    epd.Init();
    //Serial.println("hi");
    epd.Clear(1);

    
    ///// Display Main Menu Blank
    epd.DisplayFrame_Part(mainMenu, 0, 0, 136, 240, false);

    delay(5000); // Wait 3 seconds after each Display
    
    ///// Draw the Cat Looking Up
    int catWidth = 64;
    int catHeight = 64;
    epd.DisplayFrame_Part(catLookUp, 72, 180, 72 + catWidth, 180+catHeight, false);
    ///// Draw the Cursors
    int cursorDistanceFromEdge = 40;
    epd.DisplayFrame_Part(triangleLeft, 32, 104-8, 48, 120-8, false);
    epd.DisplayFrame_Part(triangleRight, 240-32, 104-8, 240-16, 120-8, false);
    epd.TurnOnDisplay();
    delay(3000);


    /* Writes the last data to another RAM */
    delay(1000);
    epd.Init();
    epd.Clear(1);
    epd.Sleep();
    Serial.println("done");
}

void loop() {
    if ((0 == digitalRead(A3)) && (button1_Debounce > 500)) { // RIGHT/Down
        button1_Debounce = millis();
        rightButton = 1;
    }
    if ((0 == digitalRead(A4)) && (button2_Debounce > 500)) { // LEFT/Up
        button2_Debounce = millis();
        leftButton = 1;
    }
    if (stage == 0) {
        //// MENU
        if ((menuSelection == 0) && (rightButton == 1) && (leftButton != 1)) {
            // move cursor down
            menuSelection = 1;
            epd.DisplayFrame_Part(blankSquare, 32, 104-8, 48, 120-8, false);
            epd.DisplayFrame_Part(blankSquare, 240-32, 104-8, 240-16, 120-8, false);
            
        }
        if ((menuSelection == 1) && (leftButton == 1) && (rightButton != 1)) {
            // move cursor up
            menuSelection = 0;
        }
        if ((rightButton == 1) && (leftButton == 1)) {
            // select menu item
            if (menuSelection == 1) {
                // go into stage 2, statistics
            }
            if (menuSelection == 0) {
                // go into stage 1, checklist
            }
        }
    }
    else if (stage == 1) {
        //// CHECKLIST
    }
    else if (stage == 2) {
        //// Statistics
    }
    else if (stage == 3) {
        //// Sleep Review
    }
    else if (stage == 4) {
        //// Day Review
    }

}













/* --------------------------------- UTILS ---------------------------------*/
/* --------------------------------- UTILS ---------------------------------*/
/* --------------------------------- UTILS ---------------------------------*/
/*
void charToBinary(unsigned char c, unsigned int* binaryPixel) {
    // Iterate from the most significant bit (MSB) to the least significant bit (LSB)
    for (int i = 7; i >= 0; i--) {
        // Use the right shift operator (>>) to move the desired bit to the LSB position
        // Use the bitwise AND operator (&) with 1 to isolate that bit
        int bit = (c >> i) & 1;
        binaryPixel[i] = bit;
    }
}*/


void drawImagePartial(Epd epd, unsigned int xOffset, unsigned int yOffset, unsigned int imageWidth, unsigned int imageHeight, unsigned char* image) {
    unsigned int binaryBits[8];
    paint.SetWidth(imageWidth);
    paint.SetHeight(imageHeight);
    paint.SetRotate(0);
    paint.Clear(UNCOLORED);

    for (int n = 0; n < (imageHeight*imageWidth)/8; n++) {
        int xByte = n % (imageWidth/8);
        int yBit = n/(imageWidth / 8);
        int xBit = 0;

        unsigned char bits = pgm_read_byte(image + n);
    
        charToBinary(bits, binaryBits);
        
        for (int i = 0; i < 8; i++) {
            xBit = xByte*8 +7-i;
            paint.DrawPixel(xBit, yBit, binaryBits[i]);
            /*paint.DrawPixel(xBit*2, yBit*2, binaryBits[i]);
            paint.DrawPixel(xBit*2 + 1, yBit*2, binaryBits[i]);
            paint.DrawPixel(xBit*2, yBit*2+1, binaryBits[i]);
            paint.DrawPixel(xBit*2 + 1, yBit*2+1, binaryBits[i]);*/
        }
    }
    //paint.DrawFilledRectangle(0, 0, 30, 30, 0);
    
    /*for (int x = 0; x < 80; x++) {
        for (int y = 0; y < 160; y++) {
            paint.DrawPixel(x, y, 0x00);
        }
    }*/

    //paint.DrawFilledCircle(50, 50, 10, COLORED);
    /* Writes new data to RAM */
    epd.DisplayFrame_Part(paint.GetImage(), xOffset, yOffset, xOffset+imageWidth, yOffset+imageHeight, false);   // Xstart must be a multiple of 8

    //epd.DisplayFrame_Part(paint.GetImage(), xOffset, yOffset+160, xOffset+imageWidth, yOffset+imageHeight + 160, false);   // Xstart must be a multiple of 8
    
    /* Displays and toggles the RAM currently in use */
    epd.TurnOnDisplay();
}