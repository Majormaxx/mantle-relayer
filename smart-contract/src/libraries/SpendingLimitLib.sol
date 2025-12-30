// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

library SpendingLimitLib {
    // TIME CONSTANTS

    /// @notice Seconds in one day (24 hours)
    uint256 internal constant SECONDS_PER_DAY = 86400; // 24 * 60 * 60

    // TIME-BASED FUNCTIONS

    function isNewDay(uint256 lastReset) internal view returns (bool) {
        if (lastReset == 0) return true; // First time
        return getCurrentDay() > _getDayStart(lastReset);
    }

    function isNewMonth(uint256 lastReset) internal view returns (bool) {
        if (lastReset == 0) return true; // First time
        return getCurrentMonth() > _getMonthStart(lastReset);
    }

    function getCurrentDay() internal view returns (uint256) {
        unchecked {
            // Safe: Division cannot overflow
            return (block.timestamp / SECONDS_PER_DAY) * SECONDS_PER_DAY;
        }
    }

    function getCurrentMonth() internal view returns (uint256) {
        return _getMonthStart(block.timestamp);
    }

    // LIMIT CHECKING FUNCTIONS

    function checkLimit(
        uint256 spent,
        uint256 limit,
        uint256 newAmount
    ) internal pure returns (bool) {
        // Unlimited spending if limit is 0
        if (limit == 0) return false;

        // Already over-spent, reject any new spending
        if (spent >= limit) return true;

        unchecked {
            // Check if spent + newAmount would overflow
            // If it overflows, it definitely exceeds the limit
            uint256 total = spent + newAmount;
            if (total < spent) return true; // Overflow detected

            // Safe: No overflow occurred
            return total > limit;
        }
    }

    function canSpend(
        uint256 spent,
        uint256 limit,
        uint256 amount
    ) internal pure returns (bool) {
        return !checkLimit(spent, limit, amount);
    }

    function getRemainingLimit(
        uint256 spent,
        uint256 limit
    ) internal pure returns (uint256) {
        // Unlimited spending
        if (limit == 0) return type(uint256).max;

        // Over-spent or at limit
        if (spent >= limit) return 0;

        unchecked {
            // Safe: We checked spent < limit above
            return limit - spent;
        }
    }

    // RESET LOGIC

    function shouldResetDaily(uint256 lastResetDay) internal view returns (bool) {
        return isNewDay(lastResetDay);
    }

    function shouldResetMonthly(uint256 lastResetMonth) internal view returns (bool) {
        return isNewMonth(lastResetMonth);
    }

    // INTERNAL HELPER FUNCTIONS

    function _getDayStart(uint256 timestamp) private pure returns (uint256) {
        unchecked {
            // Safe: Division cannot overflow
            return (timestamp / SECONDS_PER_DAY) * SECONDS_PER_DAY;
        }
    }

    function _getMonthStart(uint256 timestamp) private pure returns (uint256) {
        unchecked {
            // Calculate days since Unix epoch
            uint256 daysSinceEpoch = timestamp / SECONDS_PER_DAY;
            
            // Add offset: Unix epoch (Jan 1 1970) to Rata Die epoch (Mar 1 0000)
            // This simplifies month calculations (Feb is last month of year)
            uint256 rataDieDays = daysSinceEpoch + 719468; // Days from Mar 1, 0000 to Jan 1, 1970
            
            // Calculate era (400-year cycle, handles leap year rules)
            uint256 era = rataDieDays / 146097; // 146097 = days in 400 years
            uint256 dayOfEra = rataDieDays % 146097;
            
            // Calculate year of era (0-399)
            uint256 yearOfEra = (dayOfEra - dayOfEra / 1460 + dayOfEra / 36524 - dayOfEra / 146096) / 365;
            uint256 year = yearOfEra + era * 400;
            
            // Calculate day of year (0-365)
            uint256 dayOfYear = dayOfEra - (365 * yearOfEra + yearOfEra / 4 - yearOfEra / 100);
            
            // Calculate month (0-11, where 0=Mar, 1=Apr, ..., 10=Jan, 11=Feb)
            uint256 month = (5 * dayOfYear + 2) / 153;
            
            // Calculate day of month (1-31)
            // uint256 dayOfMonth = dayOfYear - (153 * month + 2) / 5 + 1;
            
            // Adjust month and year (convert from Mar-based to Jan-based)
            if (month >= 10) {
                // Month is Jan or Feb of next year
                month = month - 10; // 10->0 (Jan), 11->1 (Feb)
                year = year + 1;
            } else {
                // Month is Mar-Dec of current year
                month = month + 2; // 0->2 (Mar), 1->3 (Apr), ..., 9->11 (Dec)
            }
            
            // Now we have: year, month (0-11), day=1
            // Convert back to days since Mar 1, 0000
            uint256 y = year;
            uint256 m = month;
            
            // Adjust for Mar-based year
            if (m < 2) {
                y = y - 1;
                m = m + 10; // Jan->10, Feb->11
            } else {
                m = m - 2; // Mar->0, Apr->1, ..., Dec->9
            }
            
            // Calculate days since Mar 1, 0000 for the 1st of the month
            uint256 e = y / 400;
            uint256 yoe = y % 400;
            uint256 doy = (153 * m + 2) / 5; // Day of year (from Mar 1)
            uint256 doe = yoe * 365 + yoe / 4 - yoe / 100 + doy; // Day of era
            uint256 resultDays = e * 146097 + doe;
            
            // Convert back to Unix timestamp (subtract offset, multiply by seconds per day)
            return (resultDays - 719468) * SECONDS_PER_DAY;
        }
    }
}
