*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}     http://localhost:3000/admin/rooms

*** Test Cases ***
Access Admin Settings Page
    Open Browser    ${URL}   Chrome
    Wait Until Page Contains    Rooms
    Element Should Be Visible    xpath://button[contains(.,'Add')]
    Close Browser
Add Room Successfully
    Open Browser    ${URL}   Chrome
    Maximize Browser Window

    # Open Add Room modal
    Click Button    xpath://button[@data-bs-target='#add-room']
    Wait Until Element Is Visible    id:add-room

    # Fill and submit form
    Input Text    xpath://input[@name="name"]    Test Room
    Input Text    xpath://input[@name="area"]   Test Location
    Input Text    xpath://input[@name="price"]   1000000
    Input Text    xpath://input[@name="description"]   Test description
    Click Button    xpath=//button[contains(., 'Submit')]

    # Wait for redirect and updated content
    Wait Until Page Contains Element   xpath=//h5[contains(text(),'Test Room')]