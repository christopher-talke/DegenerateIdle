# DegenerateIdle Bot Commands

This document outlines the available commands for the DegenerateIdle Discord bot.

## Gamble Commands

These commands are related to gambling activities within the game.

### `!join`

*   **Description:**  Joins the current gambling session.
*   **Usage:** `!join`

### `!gamble <amount> <bet>`

*   **Description:** Places a bet on the Roulette game.
*   **Parameters:**
    *   `<amount>`: The amount of in-game currency you wish to bet.
    *   `<bet>`: The bet you want to place. See the "Betting Options" section below for valid bet types.
*   **Usage:** `!gamble 100 red`  (Bets 100 currency on red)
*   **Example:** `!gamble 50 17` (Bets 50 currency on the number 17)

## Player Commands

These commands allow you to view information about yourself or other players.

### `!me`

*   **Description:** Displays your own player information (e.g., balance, stats).
*   **Usage:** `!me`

### `!player_info <player_name>`

*   **Description:** Displays information about another player.
*   **Parameters:**
    *   `<player_name>`: The Discord username of the player you want to view information about.
*   **Usage:** `!player_info @DiscordUser`

## Bank Commands

These commands are related to managing your in-game currency.

### `!transfer <recipient> <amount>`

*   **Description:** Transfers currency to another player.
*   **Parameters:**
    *   `<recipient>`: The Discord username of the player you want to send money to.
    *   `<amount>`: The amount of currency you want to transfer.
*   **Usage:** `!transfer @DiscordUser 250` (Transfers 250 currency to @DiscordUser)

## Betting Options

The `!gamble` command accepts a variety of bet types. Here's a breakdown:

### Straight Up Bets

Betting on a single number.

*   `0`, `1`, `2`, ..., `36`

### Standard Bets

These are common roulette bets with predefined number groupings.

*   `green`:  Bets on the green number (0).
*   `black`: Bets on all black numbers.
*   `red`: Bets on all red numbers.
*   `first_third`: Bets on numbers 1-12.
*   `second_third`: Bets on numbers 13-24.
*   `third_third`: Bets on numbers 25-36.
*   `first_row`: Bets on the numbers in the first row (3, 6, 9, ...).
*   `second_row`: Bets on the numbers in the second row (2, 5, 8, ...).
*   `third_row`: Bets on the numbers in the third row (1, 4, 7, ...).
*   `first_half`: Bets on numbers 1-18.
*   `second_half`: Bets on numbers 19-36.
*   `even`: Bets on all even numbers.
*   `odd`: Bets on all odd numbers.

### Split Bets

Betting on two adjacent numbers.  Represented as `<number1>|<number2>`.

*   `0|3`, `3|6`, `3|2`, `3|0`, `6|9`, `6|5`, `6|3`, `9|12`, `9|8`, `9|6`, `12|15`, `12|11`, `12|9`, `15|18`, `15|14`, `15|12`, `18|21`, `18|17`, `18|15`, `21|24`, `21|20`, `21|18`, `24|27`, `24|23`, `24|21`, `27|30`, `27|26`, `27|24`, `30|33`, `30|29`, `30|27`, `33|36`, `33|32`, `33|30`, `36|35`, `36|33`
*   `0|2`, `2|3`, `2|5`, `2|1`, `2|0`, `5|6`, `5|8`, `5|4`, `5|2`, `8|9`, `8|11`, `8|7`, `8|5`, `11|12`, `11|14`, `11|10`, `11|8`, `14|15`, `14|17`, `14|13`, `14|11`, `17|18`, `17|20`, `17|16`, `17|14`, `20|21`, `20|23`, `20|19`, `20|17`, `23|24`, `23|26`, `23|22`, `23|20`, `26|27`, `26|29`, `26|25`, `26|23`, `29|30`, `29|32`, `29|28`, `29|26`, `32|33`, `32|35`, `32|31`, `32|29`, `35|36`, `35|34`, `35|32`
*   `0|1`, `1|2`, `1|4`, `1|0`, `4|5`, `4|7`, `4|1`, `7|8`, `7|10`, `7|4`, `10|11`, `10|13`, `10|7`, `13|14`, `13|16`, `13|10`, `16|17`, `16|19`, `16|13`, `19|20`, `19|22`, `19|16`, `22|23`, `22|25`, `22|19`, `25|26`, `25|28`, `25|22`, `28|29`, `28|31`, `28|25`, `31|32`, `31|34`, `31|28`, `34|35`, `34|31`

### Corner/Quad Bets

Betting on four numbers that form a corner. Represented as `<number1>|<number2>|<number3>|<number4>`.

*   `0|3|2`, `3|2|6|5`, `3|2|0`, `6|5|9|8`, `6|5|3|2`, `9|8|12|11`, `9|8|6|5`, `12|11|15|14`, `12|11|9|8`, `15|14|18|17`, `15|14|12|11`, `18|17|21|20`, `18|17|15|14`, `21|20|24|23`, `21|20|18|17`, `24|23|27|26`, `24|23|21|20`, `27|26|30|29`, `27|26|24|23`, `30|29|33|32`, `30|29|27|26`, `33|32|36|35`, `33|32|30|29`, `36|35|33|32`
*   `0|2|3`, `0|2|1`, `2|3|0`, `2|3|5|6`, `2|1|5|4`, `2|1|0`, `5|6|2|3`, `5|6|8|9`, `5|4|8|7`, `5|4|2|1`, `8|9|5|6`, `8|9|11|12`, `8|7|11|10`, `8|7|5|4`, `11|12|8|9`, `11|12|14|15`, `11|10|14|13`, `11|10|8|7`, `14|15|11|12`, `14|15|17|18`, `14|13|17|16`, `14|13|11|10`, `17|18|14|15`, `17|18|20|21`, `17|16|20|19`, `17|16|14|13`, `20|21|17|18`, `20|21|23|24`, `20|19|23|22`, `20|19|17|16`, `23|24|20|21`, `23|24|26|27`, `23|22|26|25`, `23|22|20|19`, `26|27|23|24`, `26|27|29|30`, `26|25|29|28`, `26|25|23|22`, `29|30|26|27`, `29|30|32|33`, `29|28|32|31`, `29|28|26|25`, `32|33|29|30`, `32|33|35|36`, `32|31|35|34`, `32|31|29|28`, `35|36|32|33`, `35|34|32|31`
*   `0|1|2`, `1|2|0`, `1|2|4|5`, `4|5|1|2`, `4|5|7|8`, `7|8|4|5`, `7|8|10|11`, `10|11|7|8`, `10|11|13|14`, `13|14|10|11`, `13|14|16|17`, `16|17|13|14`, `16|17|19|20`, `19|20|16|17`, `19|20|22|23`, `22|23|19|20`, `22|23|25|26`, `25|26|22|23`, `25|26|28|29`, `28|29|25|26`, `28|29|31|32`, `31|32|28|29`, `31|32|34|35`, `34|35|31|32`

### Street/Line Bets

Betting on a row of three numbers. Represented as `<number>^`.

*   `1^`: Covers 1, 2, 3
*   `4^`: Covers 4, 5, 6
*   `7^`: Covers 7, 8, 9
*   `10^`: Covers 10, 11, 12
*   `13^`: Covers 13, 14, 15
*   `16^`: Covers 16, 17, 18
*   `19^`: Covers 19, 20, 21
*   `22^`: Covers 22, 23, 24
*   `25^`: Covers 25, 26, 27
*   `28^`: Covers 28, 29, 30
*   `31^`: Covers 31, 32, 33
*   `34^`: Covers 34, 35, 36

### Double Street Bets

Betting on two adjacent rows of three numbers (six numbers total). Represented as `<number1>^<number2>`.

*   `1^4`: Covers 1, 2, 3, 4, 5, 6
*   `4^7`: Covers 4, 5, 6, 7, 8, 9
*   `7^10`: Covers 7, 8, 9, 10, 11, 12
*   `10^13`: Covers 10, 11, 12, 13, 14, 15
*   `13^16`: Covers 13, 14, 15, 16, 17, 18
*   `16^19`: Covers 16, 17, 18, 19, 20, 21
*   `19^22`: Covers 19, 20, 21, 22, 23, 24
*   `22^25`: Covers 22, 23, 24, 25, 26, 27
*   `25^28`: Covers 25, 26, 27, 28, 29, 30
*   `28^31`: Covers 28, 29, 30, 31, 32, 33
*   `31^34`: Covers 31, 32, 33, 34, 35, 36

**Note:** `0^1` and `1^0` are also valid double street bets covering 0, 1, 2, and 3.