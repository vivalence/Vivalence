// lib/frequency.js

/**
 * Analyzes the frequency patterns of a vocabulary unit
 * This is a simplified Bayesian approach to frequency estimation
 *
 * @param {Object} unit - The vocabulary unit to analyze
 * @param {Object} frequencyData - The historical frequency data
 * @param {Number} timeDelta - Time since last analysis in days (default: 1)
 * @returns {Object} Frequency analysis results
 */
export function frequencyAnalyzer(unit, frequencyData = {}, timeDelta = 1) {
  // Default values if no data exists
  const defaultData = {
    frequency: 0.5, // Initial normalized frequency (0-1)
    alpha: 2, // Prior successes for Beta distribution
    beta: 2, // Prior failures for Beta distribution
    observations: [], // Historical observations
    lastUpdated: Date.now(),
  };

  // Get existing data or use defaults
  const unitData = frequencyData[unit.id] || defaultData;

  // Current frequency estimate (between 0-1)
  const currentFrequency = unitData.frequency;

  // Simulate new observation data based on real-world usage patterns
  // In a real implementation, this would come from corpus analysis or user interaction data
  const simulatedObservation = {
    timestamp: Date.now(),
    // This is where you'd integrate real frequency data from a corpus or usage logs
    occurrences: Math.random() > 0.5 ? 1 : 0, // Dummy binary observation
    corpusSize: 100, // Dummy corpus size
  };

  // Add new observation
  const observations = [...unitData.observations, simulatedObservation].slice(-30); // Keep last 30 observations

  // Calculate time-weighted observations (recent observations count more)
  const weightedObservations = observations.map((obs, index) => {
    const age = (Date.now() - obs.timestamp) / (1000 * 60 * 60 * 24); // Age in days
    const timeWeight = Math.exp(-0.1 * age); // Exponential decay based on age
    return {
      ...obs,
      weight: timeWeight,
    };
  });

  // Calculate new posterior parameters for Beta distribution
  const successObservations = weightedObservations.reduce(
    (sum, obs) => sum + (obs.occurrences > 0 ? obs.weight : 0),
    0,
  );

  const totalObservations = weightedObservations.reduce((sum, obs) => sum + obs.weight, 0);

  // Update Beta distribution parameters
  const newAlpha = unitData.alpha + successObservations;
  const newBeta = unitData.beta + (totalObservations - successObservations);

  // Calculate new frequency (mean of Beta distribution)
  const newFrequency = newAlpha / (newAlpha + newBeta);

  // Calculate trend change (difference between new and old frequency)
  const trendChange = newFrequency - currentFrequency;

  // Calculate priority score (combines frequency and trend)
  // Higher frequency words that are trending up get higher priority
  const priority = newFrequency + (trendChange > 0 ? trendChange * 2 : 0);

  // Return updated analysis
  return {
    frequency: newFrequency,
    trendChange: trendChange,
    priority: priority,
    alpha: newAlpha,
    beta: newBeta,
    observations: observations,
    lastUpdated: Date.now(),
  };
}

/**
 * Categorizes vocabulary units by frequency bands
 *
 * @param {Number} frequency - Normalized frequency (0-1)
 * @returns {String} Frequency category
 */
export function frequencyCategory(frequency) {
  if (frequency > 0.8) return "Very Common";
  if (frequency > 0.6) return "Common";
  if (frequency > 0.4) return "Moderately Common";
  if (frequency > 0.2) return "Uncommon";
  return "Rare";
}

/**
 * Formats trend change information for display
 *
 * @param {Number} trendChange - Change in frequency (-1 to 1)
 * @returns {String} Trend description
 */
export function trendDescription(trendChange) {
  if (trendChange > 0.1) return "↑↑ Rapidly increasing usage";
  if (trendChange > 0.05) return "↑ Increasing usage";
  if (trendChange > -0.05 && trendChange < 0.05) return "→ Stable usage";
  if (trendChange > -0.1) return "↓ Decreasing usage";
  return "↓↓ Rapidly decreasing usage";
}
